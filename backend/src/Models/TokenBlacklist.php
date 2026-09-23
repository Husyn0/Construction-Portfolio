<?php
namespace App\Models;

use App\Helpers\Database;
use PDO;

class TokenBlacklist {
    public static function add($token, $userId, $expiresAt) {
        $db = Database::getInstance()->getConnection();
        $hash = hash('sha256', $token);
        $stmt = $db->prepare("
            INSERT INTO token_blacklist (token_hash, user_id, expires_at) 
            VALUES (:hash, :user_id, :expires_at)
            ON DUPLICATE KEY UPDATE expires_at = :expires_at
        ");
        return $stmt->execute([
            ':hash' => $hash,
            ':user_id' => $userId,
            ':expires_at' => $expiresAt
        ]);
    }

    public static function isBlacklisted($token) {
        $db = Database::getInstance()->getConnection();
        $hash = hash('sha256', $token);
        $stmt = $db->prepare("
            SELECT id FROM token_blacklist 
            WHERE token_hash = :hash AND expires_at > NOW()
        ");
        $stmt->execute([':hash' => $hash]);
        return (bool) $stmt->fetch();
    }

    public static function cleanup() {
        $db = Database::getInstance()->getConnection();
        $db->exec("DELETE FROM token_blacklist WHERE expires_at < NOW()");
    }
}