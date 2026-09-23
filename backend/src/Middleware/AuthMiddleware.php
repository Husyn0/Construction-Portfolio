<?php
// src/Middleware/AuthMiddleware.php
namespace App\Middleware;

use App\Services\JWTService;
use App\Helpers\Response;
use App\Models\User;
use App\Models\TokenBlacklist;

class AuthMiddleware {
    private $jwtService;

    public function __construct() {
        $this->jwtService = new JWTService();
    }

    public function authenticate($requiredRoles = null) {
        $headers = getallheaders();

        // Some servers don't return Authorization in getallheaders() — check $_SERVER too
        $authHeader = $headers['Authorization']
            ?? $headers['authorization']
            ?? $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? null;

        if (!$authHeader) {
            Response::unauthorized('Authorization header missing');
            return false;
        }

        // Check if it's a Bearer token
        if (stripos($authHeader, 'Bearer ') !== 0) {
            Response::unauthorized('Invalid authorization format');
            return false;
        }

        $token = trim(substr($authHeader, 7));

        if ($token === '') {
            Response::unauthorized('Empty token');
            return false;
        }

        // 1) Check blacklist FIRST
        if (TokenBlacklist::isBlacklisted($token)) {
            Response::unauthorized('Token has been revoked');
            return false;
        }

        // 2) Verify signature + expiry
        $decoded = $this->jwtService->verify($token);
        if (!$decoded) {
            Response::unauthorized('Invalid or expired token');
            return false;
        }

        // 3) Load user
        $user = User::find($decoded->sub);
        if (!$user) {
            Response::unauthorized('User not found');
            return false;
        }

        if (!$user['is_active']) {
            Response::unauthorized('User account is inactive');
            return false;
        }

        // 4) Role check
        if ($requiredRoles && !in_array($user['role'], (array) $requiredRoles)) {
            Response::forbidden('Insufficient permissions');
            return false;
        }

        // 5) Store user + raw token in globals
        $GLOBALS['user'] = $user;
        $GLOBALS['raw_token'] = $token;   // <-- CRITICAL: needed by logout()
        $GLOBALS['token_exp'] = $decoded->exp ?? (time() + 86400);

        return $user;
    }

    public static function user() {
        return $GLOBALS['user'] ?? null;
    }

    public static function rawToken() {
        return $GLOBALS['raw_token'] ?? null;
    }
}