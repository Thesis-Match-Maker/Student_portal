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

$page = "index";
if(isset($_GET) && isset($_GET['page']))
  if(in_array($_GET["page"], array("experiences", "interests", "project_duration")))
    $page = $_GET["page"];


if($page == "experiences")
{
  exit(fetch_experiences($sid)['experience']);
} elseif($page == "interests")
{
  exit(fetch_interests($sid)['interest']);
} elseif($page == "project_duration")
{
  exit(json_encode(
    array(
      "start_month" => fetch_duration($sid)['start_month'],
      "end_month"   => fetch_duration($sid)['end_month'],
    )));
} elseif($page == "end_month")
{
  exit(fetch_duration($sid)['end_month']);
}
