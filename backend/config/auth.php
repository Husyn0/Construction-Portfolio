// backend/config/auth.php
<?php
return [
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? 'your_super_secret_jwt_key_change_in_production',
        'expire' => $_ENV['JWT_EXPIRE'] ?? 604800, // 7 days in seconds
        'algorithm' => 'HS256',
    ],
    'password' => [
        'hash_cost' => 12,
    ],
    'session' => [
        'expire' => 3600, // 1 hour
    ],
    'rate_limiting' => [
        'max_attempts' => 5,
        'decay_minutes' => 15,
    ],
];

?>