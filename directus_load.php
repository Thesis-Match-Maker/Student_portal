<?php
session_start();

require_once __DIR__.'/bootstrap.php';
require_once __DIR__.'/config.php';
require_once __DIR__.'/db_methods.php';

global $pdo;
global $stmt;

if(!isset($_SERVER['PHP_AUTH_USER']) && !isset($_SERVER['PHP_AUTH_PW'])) {
  $_SERVER['PHP_AUTH_USER'] = null;
  $_SERVER['PHP_AUTH_PW']   = null;
}

call_query("
  SELECT id, name, student_id
  FROM student
  WHERE name = :name
", array(
  ":name"  => $_SERVER['PHP_AUTH_USER']
));

$fetch = $stmt->fetch();

if(empty($fetch) || $fetch['student_id'] != $_SERVER['PHP_AUTH_PW'])
{
  header('WWW-Authenticate: Basic realm="Please login"');
  header('HTTP/1.0 401 Unauthorized');
  echo 'Auth failed';
  exit;
}


$sid = $fetch['id'];

$page = "projects";
if(isset($_GET) && isset($_GET['page']))
  if(in_array($_GET["page"], array("projects", "users", "project_duration", "all_courses", "courses_taught", "interests", "interests_list", "course_list", "requirements", "requirements_list")))
    $page = $_GET["page"];


function request_token($access_login)
{
  $url = '/thesis-match-maker/auth/authenticate';

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL,$url);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
  curl_setopt($ch, CURLOPT_POSTFIELDS, $access_login);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

  curl_setopt($ch, CURLOPT_HTTPHEADER, array(
      'Content-Type: application/json',
      'Content-Length: ' . strlen($access_login))
  );

  $result = curl_exec($ch);
  $info = curl_getinfo($ch);
  curl_close($ch);

  return array(
    "result"  => $result,
    "info"    => $info
  );
}

function request_page($page, $token)
{
  $url = '/thesis-match-maker/'.$page;

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL,$url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
  curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
  curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
  curl_setopt($ch, CURLOPT_USERPWD, $token);
  $result = curl_exec($ch);
  $info = curl_getinfo($ch);
  curl_close($ch);

  return array(
    "result"  => $result,
    "info"    => $info
  );
}

# token
$token_code =       array(
  "email" => "",
  "password" => ""
);

if($page == "projects")
{
  $f_token = fetch_token("directus")['token'];

  $req = request_page("custom/project/call", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("items/projects", $access_token.":");
  }
} elseif($page == "users") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("users", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("users", $access_token.":");
  }
} elseif($page == "courses_taught") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("items/courses_taught", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("items/courses_taught", $access_token.":");
  }
} elseif($page == "interests") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("items/interest_list", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("items/interest_list", $access_token.":");
  }
} elseif($page == "interests_list") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("custom/project/interests", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("custom/project/interests", $access_token.":");
  }
} elseif($page == "course_list") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("custom/project/course", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("custom/project/course", $access_token.":");
  }
}  elseif($page == "requirements") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("items/requirement_skills", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("items/requirement_skills", $access_token.":");
  }

}  elseif($page == "all_courses") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("items/course_list", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("items/course_list", $access_token.":");
  }
}  elseif($page == "requirements_list") {
  $f_token = fetch_token("directus")['token'];

  $req = request_page("custom/project/skills", $f_token.":");

  header('Content-Type: application/json');

  if($req['info']['http_code'] == 401)
  {

    $token = (request_token(json_encode(
      $token_code
    )));
    $access_token = json_decode($token["result"])->data->token;
    $new_token = update_token("directus", $access_token);

    $req = request_page("custom/project/skills", $access_token.":");
  }
}

echo($req['result']);
