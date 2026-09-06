<?php
// backend/src/Controllers/TeamController.php
namespace App\Controllers;

use App\Helpers\Response;
use App\Models\Team;

class TeamController {
    public function index() {
        $team = Team::getAll();
        return Response::success($team);
    }

    public function show($id) {
        $member = Team::find($id);
        if (!$member) {
            return Response::notFound('Team member not found');
        }
        return Response::success($member);
    }

    public function store() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required = ['name', 'role'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                return Response::error("Field '{$field}' is required", 400);
            }
        }
        
        $result = Team::create($input);
        if ($result) {
            return Response::success(null, 'Team member created successfully', 201);
        }
        return Response::error('Failed to create team member', 500);
    }

    public function update($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $member = Team::find($id);
        if (!$member) {
            return Response::notFound('Team member not found');
        }
        
        $result = Team::update($id, $input);
        if ($result) {
            return Response::success(null, 'Team member updated successfully');
        }
        return Response::error('Failed to update team member', 500);
    }

    public function delete($id) {
        $member = Team::find($id);
        if (!$member) {
            return Response::notFound('Team member not found');
        }
        
        $result = Team::delete($id);
        if ($result) {
            return Response::success(null, 'Team member deleted successfully');
        }
        return Response::error('Failed to delete team member', 500);
    }
}