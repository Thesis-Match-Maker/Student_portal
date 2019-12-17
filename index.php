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
  if(in_array($_GET["page"], array("home", "project", "settings", "logout")))
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

    # token code
    $token_code =       array(
      "email" => "",
      "password" => ""
    );

$f_duration   = fetch_duration($sid);
$start_month  = 0;
$end_month    = 0;
if(!empty($f_duration))
{
  if(!empty($f_duration['start_month']))
    $start_month = $f_duration['start_month'];
  if(!empty($f_duration['end_month']))
    $end_month = $f_duration['end_month'];
}

if($page == "settings")
{

  $f_experience = fetch_experiences($sid);
  $f_duration   = fetch_duration($sid);
  $f_interest   = fetch_interests($sid);

  $start_month  = 0;
  $end_month    = 0;
  if(!empty($f_duration))
  {
    if(!empty($f_duration['start_month']))
      $start_month = $f_duration['start_month'];
    if(!empty($f_duration['end_month']))
      $end_month = $f_duration['end_month'];
  }

    $f_token = fetch_token("directus")['token'];
    $req = request_page("items/interest_list", $f_token.":");

    // header('Content-Type: application/json');

    if($req['info']['http_code'] == 401)
    {
      $token = (request_token(json_encode(
        $token_code
      )));
      // insert_token("directus", json_decode($token["result"])->data->token);
      $access_token = json_decode($token["result"])->data->token;
      $new_token = update_token("directus", $access_token);

      $req = request_page("items/requirement_skills", $access_token.":");
    }

    $start_month_var = "";
    if($start_month != 0)
      $start_month_var = 'value="'.$start_month.'"';


    $end_month_var = "";
    if($end_month != 0)
      $end_month_var = 'value="'.$end_month.'"';

  if($_SERVER['REQUEST_METHOD'] == "POST") {
    // Interests
    if(empty($f_interest)) {
      insert_interests(
        $sid,
        json_encode($_POST['interests'])
      );
    } else {
      if(isset($_POST["interests"]))
        update_interests(
          $sid,
          json_encode($_POST['interests'])
        );
    }

    // Start month
    if(empty($f_duration)) {
      if(!ctype_digit($_POST['month']['end']))
        $end = null;
      else
        $end = $_POST['month']['end'];

        if($_POST['month']['start'] == "")
        {
          $start_date = "1/1/2020";
        } else {
          $start_date = $_POST['month']['start'];
        }
      insert_duration(
        $sid,
        $start_date,
        $end
      );
    } else {
      if(isset($_POST["month"]["start"]))
      {
        if(isset($_POST["month"]["end"]))
          if($_POST["month"]["end"] == "0")
            $end_month = null;
          else
            if(empty($_POST['month']["end"]))
              $end_month = null;
            else
              $end_month = $_POST['month']["end"];

        update_duration(
          $sid,
          $_POST['month']["start"],
          $end_month
        );
      }
    }
    header("Refresh:0");
  }

  $f_student = fetch_student($sid);

  echo $twig->render('settings.html.twig', [
    'menu' => array(
      "Home" =>
        array("position" => "left", "link" => "home"),
      "Project" =>
        array("position" => "left", "link" => "project"),
      "Logout" =>
        array("position" => "left", "link" => "logout"),
      "Settings" =>
        array("position" => "right", "link" => "settings", "chosen" => True)),
    "title"       => "Settings",
    "student_id"  => $f_student['student_id'],
    "name"        => $f_student['name'],
    "surname"     => $f_student['surname'],
    "email"       => $f_student['email'],
    "start_month" => $start_month,
    "end_month"   => $start_month,
    "start_month_var" => $start_month_var,
    "end_month_var" => $end_month_var,
    "skills"      => json_decode($req['result'], true)
  ]);
} elseif($page == "logout")
{
  // session_destroy();
  header('HTTP/1.1 401 Unauthorized');
} elseif($page == "project")
{

$f_interest   = fetch_interests($sid);
$interests    = "";
if(!empty($f_interest))
{
  if(!empty($f_interest["interest"]))
  {
    foreach(json_decode($f_interest["interest"]) as $interest)
    {
      $interests .= $interest.",";
    }
  }
}
  echo $twig->render('project.html.twig', [
    'menu' => array(
      "Home" =>
        array("position" => "left", "link" => "home"),
      "Project" =>
        array("position" => "left", "link" => "project", "chosen" => True),
      "Logout" =>
        array("position" => "left", "link" => "logout"),
      "Settings" =>
        array("position" => "right", "link" => "settings")),
    "title" => "Projects",
    "start_month" => $start_month,
    "end_month" => $end_month,
    "interests" => $interests
  ]);
} else {
  echo $twig->render('index.html.twig', [
    'menu' => array(
      "Home" =>
        array("position" => "left", "link" => "home", "chosen" => True),
      "Project" =>
        array("position" => "left", "link" => "project"),
      "Logout" =>
        array("position" => "left", "link" => "logout"),
      "Settings" =>
        array("position" => "right", "link" => "settings")),
    "title" => "Thesis Match Maker"
  ]);
}
