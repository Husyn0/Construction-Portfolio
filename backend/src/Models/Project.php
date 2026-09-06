<?php
// src/Models/Project.php
namespace App\Models;

use App\Helpers\Database;
use PDO;

class Project {
    public static function getAll($filters = [], $limit = 10, $page = 1) {
        $db = Database::getInstance()->getConnection();
        
        $where = [];
        $params = [];
        
        if (!empty($filters['category'])) {
            $where[] = "category = :category";
            $params[':category'] = $filters['category'];
        }
        
        if (!empty($filters['is_featured'])) {
            $where[] = "is_featured = :is_featured";
            $params[':is_featured'] = $filters['is_featured'];
        }

        $whereClause = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";
        
        $offset = ($page - 1) * $limit;
        
        $stmt = $db->prepare("
            SELECT * FROM projects 
            {$whereClause}
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset
        ");
        
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode tags JSON if exists
        foreach ($projects as &$project) {
            if (isset($project['tags']) && $project['tags'] !== null) {
                $project['tags'] = json_decode($project['tags'], true);
            }
        }
        
        // Get total count
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM projects {$whereClause}");
        foreach ($params as $key => $value) {
            $countStmt->bindValue($key, $value);
        }
        $countStmt->execute($params);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        return [
            'data' => $projects,
            'pagination' => [
                'page' => (int) $page,
                'limit' => (int) $limit,
                'total' => (int) $total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }

    public static function find($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM projects WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($project && isset($project['tags']) && $project['tags'] !== null) {
            $project['tags'] = json_decode($project['tags'], true);
        }
        
        return $project;
    }

    public static function create($data) {
        $db = Database::getInstance()->getConnection();
        
        // Remove fields that don't exist in schema
        unset($data['images']);
        unset($data['features']);
        unset($data['status']);
        
        // Handle tags JSON
        if (isset($data['tags']) && is_array($data['tags'])) {
            $data['tags'] = json_encode($data['tags']);
        }
        
        $fields = array_keys($data);
        $placeholders = array_map(function($field) {
            return ":$field";
        }, $fields);
        
        $sql = "INSERT INTO projects (" . implode(', ', $fields) . ") 
                VALUES (" . implode(', ', $placeholders) . ")";
        
        $stmt = $db->prepare($sql);
        return $stmt->execute($data);
    }

    public static function update($id, $data) {
        $db = Database::getInstance()->getConnection();
        
        // Handle tags JSON
        if (isset($data['tags']) && is_array($data['tags'])) {
            $data['tags'] = json_encode($data['tags']);
        }
        
        $sets = [];
        $params = [':id' => $id];
        
        foreach ($data as $key => $value) {
            $sets[] = "$key = :$key";
            $params[":$key"] = $value;
        }
        
        if (empty($sets)) {
            return true;
        } 
        $sql = "UPDATE projects SET " . implode(', ', $sets) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        return $stmt->execute($params);
    }

    public static function delete($id) {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("DELETE FROM projects WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}