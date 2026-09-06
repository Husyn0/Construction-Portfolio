<?php
// src/Models/Content.php
namespace App\Models;

use App\Helpers\Database;
use PDO;

class Content {
    public static function getLatest($section) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT * FROM content 
            WHERE section = :section AND is_published = 1 
            ORDER BY created_at DESC LIMIT 1
        ");
        $stmt->execute([':section' => $section]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($result && is_string($result['data'])) {
            $decoded = json_decode($result['data'], true);
            if ($decoded === null) {
                $cleanData = trim($result['data']);
                if (strpos($cleanData, '"') === 0) {
                    $cleanData = stripslashes($cleanData);
                    $cleanData = trim($cleanData, '"');
                    $cleanData = stripslashes($cleanData);
                    $decoded = json_decode($cleanData, true);
                }
            }
            $result['data'] = $decoded ?: [];
        }
    
        return $result;
    }

    public static function create($data) {
        $db = Database::getInstance()->getConnection();
        
        $stmt = $db->prepare("
            INSERT INTO content (section, data, last_modified_by, is_published, 
                image_1, image_1_alt, image_2, image_2_alt) 
            VALUES (:section, :data, :last_modified_by, :is_published, 
                :image_1, :image_1_alt, :image_2, :image_2_alt)
        ");
        
        return $stmt->execute([
            ':section' => $data['section'],
            ':data' => json_encode($data['data']),
            ':last_modified_by' => $data['last_modified_by'] ?? null,
            ':is_published' => $data['is_published'] ?? true,
            ':image_1' => $data['image_1'] ?? null,
            ':image_1_alt' => $data['image_1_alt'] ?? null,
            ':image_2' => $data['image_2'] ?? null,
            ':image_2_alt' => $data['image_2_alt'] ?? null
        ]);
    }

    public static function getHistory($section) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT c.*, u.name as modified_by_name 
            FROM content c
            LEFT JOIN users u ON c.last_modified_by = u.id
            WHERE c.section = :section 
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([':section' => $section]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}