<?php
// src/Controllers/AuthController.php
namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Models\User;
use App\Models\TokenBlacklist;
use App\Services\JWTService;

class AuthController {
    private $jwtService;

    public function __construct() {
        $this->jwtService = new JWTService();
    }

    public function login() {
        $input = json_decode(file_get_contents('php://input'), true);

        // Validate input
        $validator = new Validator($input);
        $validator->required('email')->email('email');
        $validator->required('password');

        if (!$validator->passes()) {
            return Response::validationError($validator->errors());
        }

        // Find user
        $user = User::findByEmail($input['email']);
        if (!$user) {
            return Response::unauthorized('Invalid credentials');
        }

        if (!$user['is_active']) {
            return Response::unauthorized('Account is deactivated');
        }

        if (!User::verifyPassword($input['password'], $user['password'])) {
            return Response::unauthorized('Invalid credentials');
        }

        // Update last login
        User::update($user['id'], ['last_login' => date('Y-m-d H:i:s')]);

        // Generate token
        $token = $this->jwtService->generate($user['id'], [
            'role'  => $user['role'],
            'email' => $user['email'],
        ]);

        unset($user['password']);

        return Response::success([
            'user'  => $user,
            'token' => $token,
        ], 'Login successful');
    }

    public function register() {
        $input = json_decode(file_get_contents('php://input'), true);

        $validator = new Validator($input);
        $validator->required('name')->string('name')->minLength('name', 2);
        $validator->required('email')->email('email');
        $validator->required('password')->minLength('password', 6);

        if (!$validator->passes()) {
            return Response::validationError($validator->errors());
        }

        if (User::findByEmail($input['email'])) {
            return Response::error('User already exists', 400);
        }

        $userId = User::create([
            'name'     => $input['name'],
            'email'    => $input['email'],
            'password' => $input['password'],
            'role'     => $input['role'] ?? 'viewer',
        ]);

        $user = User::find($userId);
        unset($user['password']);

        return Response::success($user, 'User registered successfully', 201);
    }

    public function me() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            return Response::unauthorized('Not authenticated');
        }

        unset($user['password']);
        return Response::success($user);
    }

    /**
     * Logout — blacklists the current token so it can't be reused.
     */
    public function logout() {
        $user  = $GLOBALS['user'] ?? null;
        $token = $GLOBALS['raw_token'] ?? null;

        if (!$user) {
            return Response::unauthorized('Not authenticated');
        }

        if ($token) {
            // exp is a unix timestamp from JWT
            $expiresAt = $GLOBALS['token_exp'] ?? (time() + 86400);

            try {
                TokenBlacklist::add($token, $user['id'], $expiresAt);
            } catch (\Throwable $e) {
                error_log("Blacklist add failed: " . $e->getMessage());
                // Still return success — the client should clear its token regardless
            }
        }

        return Response::success(null, 'Logged out successfully');
    }

    public function updateProfile() {
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            return Response::unauthorized('Not authenticated');
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $updateData = [];
        if (isset($input['name'])) {
            $updateData['name'] = $input['name'];
        }
        if (isset($input['email'])) {
            $existing = User::findByEmail($input['email']);
            if ($existing && $existing['id'] != $user['id']) {
                return Response::error('Email already taken', 400);
            }
            $updateData['email'] = $input['email'];
        }
        if (isset($input['password']) && !empty($input['password'])) {
            $updateData['password'] = $input['password'];
        }

        if (empty($updateData)) {
            return Response::error('No data to update', 400);
        }

        User::update($user['id'], $updateData);
        $updatedUser = User::find($user['id']);
        unset($updatedUser['password']);

        return Response::success($updatedUser, 'Profile updated successfully');
    }
}