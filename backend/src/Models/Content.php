<?php
// src/Models/Content.php
namespace App\Models;

use App\Helpers\Database;
use PDO;

class Content {

    public static function getLatest($section) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM content WHERE section = :section LIMIT 1");
        $stmt->execute([':section' => $section]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && is_string($result['data'])) {
            $decoded = json_decode($result['data'], true);
            if ($decoded === null) {
                $clean = trim($result['data']);
                if (strpos($clean, '"') === 0) {
                    $clean = stripslashes($clean);
                    $clean = trim($clean, '"');
                    $clean = stripslashes($clean);
                    $decoded = json_decode($clean, true);
                }
            }
            $result['data'] = $decoded ?: [];
        }

        return $result;
    }

    /**
     * One row per section — INSERT if missing, UPDATE otherwise.
     * Only updates image fields that were passed (non-null).
     */
    public static function upsert($section, $data) {
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT id FROM content WHERE section = :section LIMIT 1");
        $stmt->execute([':section' => $section]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $sets   = ['data = :data', 'is_published = :is_published', 'last_modified_by = :lmb', 'updated_at = NOW()'];
            $params = [
                ':section'        => $section,
                ':data'           => json_encode($data['data']),
                ':is_published'   => $data['is_published'] ?? 1,
                ':lmb'            => $data['last_modified_by'] ?? null,
            ];

            // Only update image_* when explicitly provided
            foreach (['image_1', 'image_1_alt', 'image_2', 'image_2_alt'] as $f) {
                if (array_key_exists($f, $data)) {
                    $sets[]           = "{$f} = :{$f}";
                    $params[":{$f}"]  = $data[$f];
                }
            }

            $sql  = "UPDATE content SET " . implode(', ', $sets) . " WHERE section = :section";
            $stmt = $db->prepare($sql);
            return $stmt->execute($params);
        }

        // INSERT
        $stmt = $db->prepare("
            INSERT INTO content (section, data, image_1, image_1_alt, image_2, image_2_alt, is_published, last_modified_by)
            VALUES (:section, :data, :image_1, :image_1_alt, :image_2, :image_2_alt, :is_published, :last_modified_by)
        ");

        return $stmt->execute([
            ':section'        => $section,
            ':data'           => json_encode($data['data']),
            ':image_1'        => $data['image_1']        ?? null,
            ':image_1_alt'    => $data['image_1_alt']    ?? null,
            ':image_2'        => $data['image_2']        ?? null,
            ':image_2_alt'    => $data['image_2_alt']    ?? null,
            ':is_published'   => $data['is_published']   ?? 1,
            ':last_modified_by' => $data['last_modified_by'] ?? null,
        ]);
    }

    public static function getHistory($section) {
        // History is disabled (one row per section) — return current row.
        $current = self::getLatest($section);
        return $current ? [$current] : [];
    }
}