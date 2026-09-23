<?php
// src/Models/TokenBlacklist.php
namespace App\Models;

use App\Helpers\Database;
use PDO;

class TokenBlacklist {

    /**
     * Add a token to the blacklist.
     * Called on logout.
     */
    public static function add($token, $userId, $expiresAt) {
        $db = Database::getInstance()->getConnection();
        $hash = hash('sha256', $token);

        // Normalize expiresAt to MySQL DATETIME string
        if (is_int($expiresAt) || ctype_digit((string)$expiresAt)) {
            $expiresAt = date('Y-m-d H:i:s', (int)$expiresAt);
        }

        // IMPORTANT: Do NOT reuse the same named param twice —
        // with ATTR_EMULATE_PREPARES=false MySQL rejects it.
        // Use INSERT IGNORE, then UPDATE if needed, or use VALUES().
        $stmt = $db->prepare("
            INSERT INTO token_blacklist (token_hash, user_id, expires_at)
            VALUES (:hash, :user_id, :expires_at)
            ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at)
        ");

        return $stmt->execute([
            ':hash'       => $hash,
            ':user_id'    => $userId,
            ':expires_at' => $expiresAt,
        ]);
    }

    /**
     * Check if a token has been revoked.
     */
    public static function isBlacklisted($token) {
        $db = Database::getInstance()->getConnection();
        $hash = hash('sha256', $token);

        $stmt = $db->prepare("
            SELECT id FROM token_blacklist
            WHERE token_hash = :hash AND expires_at > NOW()
            LIMIT 1
        ");
        $stmt->execute([':hash' => $hash]);
        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Remove expired tokens. Run occasionally (cron) to keep table small.
     */
    public static function cleanup() {
        $db = Database::getInstance()->getConnection();
        $db->exec("DELETE FROM token_blacklist WHERE expires_at < NOW()");
    }
}