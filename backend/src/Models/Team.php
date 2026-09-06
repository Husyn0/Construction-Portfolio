<?php
// backend/src/Models/Team.php
namespace App\Models;

use App\Helpers\Database;
use PDO;

class Team {
    public static function getAll() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT * FROM team 
            WHERE is_active = 1 
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM team WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create($data) {
        $db = Database::getInstance()->getConnection();
        
        // Handle social links if passed as JSON
        if (isset($data['social']) && is_array($data['social'])) {
            if (isset($data['social']['linkedin'])) {
                $data['social_linkedin'] = $data['social']['linkedin'];
            }
            if (isset($data['social']['twitter'])) {
                $data['social_twitter'] = $data['social']['twitter'];
            }
            if (isset($data['social']['github'])) {
                $data['social_github'] = $data['social']['github'];
            }
            unset($data['social']);
        } 
        //
        $fields = array_keys($data);
        $placeholders = array_map(function($field) {
            return ":$field";
        }, $fields);
        
        $sql = "INSERT INTO team (" . implode(', ', $fields) . ") 
                VALUES (" . implode(', ', $placeholders) . ")";
        
        $stmt = $db->prepare($sql);
        return $stmt->execute($data);
    }

    public static function update($id, $data) {
        $db = Database::getInstance()->getConnection();
        
        // Handle social links if passed as JSON
        if (isset($data['social']) && is_array($data['social'])) {
            if (isset($data['social']['linkedin'])) {
                $data['social_linkedin'] = $data['social']['linkedin'];
            }
            if (isset($data['social']['twitter'])) {
                $data['social_twitter'] = $data['social']['twitter'];
            }
            if (isset($data['social']['github'])) {
                $data['social_github'] = $data['social']['github'];
            }
            unset($data['social']);
        }

        $sets = [];
        $params = [':id' => $id];
        
        foreach ($data as $key => $value) {
            $sets[] = "$key = :$key";
            $params[":$key"] = $value;
        }
        
        $sql = "UPDATE team SET " . implode(', ', $sets) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }

    public static function delete($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("DELETE FROM team WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}