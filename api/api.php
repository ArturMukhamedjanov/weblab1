<?php
error_reporting(-1);
$startTime = microtime(true);
session_start();

function check_x($x): bool
{
    return $x >= -3 and $x <= 5;
}

function check_y($y): bool
{
    return $y >= -3 and $y <= 5;
}

function check_r($r): bool
{
    if( $r!= 1 and $r != 1.5 and $r != 2 and $r != 2.5 and $r != 3){
        return false;
    }
    return true;
}

function check_hit($x, $y, $r): string
{
    // check 1-st section - square
    if ($x <= 0 and $y >= 0 and $x >= -$r and $y <= $r) return "Попадание";
    // check 2-nd section - 1/4 circle
    else if ($x <= 0 and $y <= 0 and (pow($x, 2) + pow($y, 2) <= pow($r / 2, 2)))
        return "Попадание";
    // check 3-th section - triangle
    else if (isPointInTriangle($x, $y, $r)) return "Попадание";
    // everything else is miss
    else return "Промах";
}

function isPointInTriangle($x, $y, $r) {
    // Define the vertices of the triangle
    $vertex1 = [0, 0];
    $vertex2 = [0, $r / 2];
    $vertex3 = [$r, 0];

    // Calculate the barycentric coordinates
    $denominator = (($vertex2[1] - $vertex3[1]) * ($vertex1[0] - $vertex3[0])) + (($vertex3[0] - $vertex2[0]) * ($vertex1[1] - $vertex3[1]));

    $alpha = ((($vertex2[1] - $vertex3[1]) * ($x - $vertex3[0])) + (($vertex3[0] - $vertex2[0]) * ($y - $vertex3[1]))) / $denominator;
    $beta = ((($vertex3[1] - $vertex1[1]) * ($x - $vertex3[0])) + (($vertex1[0] - $vertex3[0]) * ($y - $vertex3[1]))) / $denominator;
    $gamma = 1 - $alpha - $beta;

    // Check if the point is inside the triangle or on its edges
    return ($alpha >= 0 && $beta >= 0 && $gamma >= 0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve the POST data
    $x = $_POST['X'];
    $y = $_POST['Y'];
    $r = $_POST['R'];
    if (strlen($x) <= 15 && strlen($y) <= 15 && check_x($x) and check_y($y) and check_r($r)) {
        $result = check_hit($x, $y, $r);
    } else {
        $result = "Ошибка введенных данных";
    }

    $executeTime = round(microtime(true) - $startTime, 12);
    // Store the result in the session
    $sessionResult = [
        'X' => $x,
        'Y' => $y,
        'R' => $r,
        'Inside' => $result,
        'time' => time(),
        'executetime' => $executeTime
    ];

    if (!isset($_SESSION['results'])) {
        $_SESSION['results'] = [];
    }

    $response = [
        'X' => $x,
        'Y' => $y,
        'R' => $r,
        'Inside' => $result, // Replace this with your actual result
        'time' => time(), // Current timestamp
        'executetime' => $executeTime // Current execution time
    ];

    $_SESSION['results'][] = $sessionResult;
    $json_response = json_encode($response);
    header('Content-Type: application/json');
    echo $json_response;
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return all session results
    //if (isset($_SESSION['results'])) {
        header('Content-Type: application/json');
        echo json_encode($_SESSION['results']);
    //} else {
    //    http_response_code(404);
    //    echo json_encode(['error' => 'No results found in session']);
    //}
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request method']);
}
?>
