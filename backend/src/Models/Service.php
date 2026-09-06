<?php
// backend/src/Models/Service.php
namespace App\Models;

use App\Helpers\Database;
use PDO;

class Service {
    public static function getAll() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT * FROM services 
            WHERE is_active = 1 
            ORDER BY created_at DESC
        ");
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $services;
    }

    public static function find($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM services WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $service = $stmt->fetch(PDO::FETCH_ASSOC);
        return $service;
    }

    public static function create($data) {
        $db = Database::getInstance()->getConnection();
        
        // Handle image field if present
        if (isset($data['image']) && !empty($data['image'])) {
            // Image path is already set
        }
        
        $fields = array_keys($data);
        $placeholders = array_map(function($field) {
            return ":$field";
        }, $fields);
        
        $sql = "INSERT INTO services (" . implode(', ', $fields) . ") 
                VALUES (" . implode(', ', $placeholders) . ")";
        
        $stmt = $db->prepare($sql);
        return $stmt->execute($data);
    }

    public static function update($id, $data) {
        $db = Database::getInstance()->getConnection();
        $sets = [];
        $params = [':id' => $id];
        
        foreach ($data as $key => $value) {
            $sets[] = "$key = :$key";
            $params[":$key"] = $value;
        }
        
        if (empty($sets)) {
            return true;
        }
        
        $sql = "UPDATE services SET " . implode(', ', $sets) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }

    public static function delete($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("DELETE FROM services WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}