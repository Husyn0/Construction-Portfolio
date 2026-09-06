<?php
// backend/src/Controllers/ProjectController.php
namespace App\Controllers;

use App\Helpers\Response;
use App\Models\Project;

class ProjectController {
    public function index() {
        $limit = $_GET['limit'] ?? 10;
        $page = $_GET['page'] ?? 1;
        $category = $_GET['category'] ?? null;
        $featured = isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null;
        
        $filters = [];
        if ($category) $filters['category'] = $category;
        if ($featured !== null) $filters['is_featured'] = $featured;
        
        $result = Project::getAll($filters, $limit, $page);
        return Response::success($result);
    }

    public function show($id) {
        $project = Project::find($id);
        if (!$project) {
            return Response::notFound('Project not found');
        }
        return Response::success($project);
    }

    public function store() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required = ['title', 'category', 'location'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                return Response::error("Field '{$field}' is required", 400);
            }
        }

        // Set default values for optional fields
        if (!isset($input['description'])) {
            $input['description'] = '';
        }
        if (!isset($input['is_featured'])) {
            $input['is_featured'] = 0;
        }

        $result = Project::create($input);
        if ($result) {
            return Response::success(null, 'Project created successfully', 201);
        }
        return Response::error('Failed to create project', 500);
    }

    public function update($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $project = Project::find($id);
        if (!$project) {
            return Response::notFound('Project not found');
        }
        
        $result = Project::update($id, $input);
        if ($result) {
            return Response::success(null, 'Project updated successfully');
        }
        return Response::error('Failed to update project', 500);
    }

    public function delete($id) {
        $project = Project::find($id);
        if (!$project) {
            return Response::notFound('Project not found');
        }
        
        $result = Project::delete($id);
        if ($result) {
            return Response::success(null, 'Project deleted successfully');
        }
        return Response::error('Failed to delete project', 500);
    }
}