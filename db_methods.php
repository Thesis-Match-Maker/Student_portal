<?php

function insert_student(
  $name,
  $surname,
  $email,
  $user_id
  )
{
  return call_query(
    'INSERT INTO student (name, surname, email, student_id)
    VALUES (:name, :surname, :email, :sid)',
    array(
      ":name"     => $name,
      ":surname"  => $surname,
      ":email"    => $email,
      ":sid"      => $user_id
    )
  );
}

// FETCH
function fetch_student($sid)
{
  global $stmt;
  call_query("
    SELECT *
    FROM student
    WHERE id = :sid
  ", array(
    ":sid"  => $sid
  ));
  return $stmt->fetch();
}

// INTEREST
// INSERT
function insert_interests(
  $student_id,
  $interest
  )
{
  return call_query(
    'INSERT INTO interests (sid, interest)
    VALUES (:sid, :interest)',
    array(
      ":interest" => $interest,
      ":sid"      => $student_id
    )
  );
}
// FETCH
function fetch_interests($sid)
{
  global $stmt;
  call_query("
    SELECT *
    FROM interests
    WHERE sid = :sid
  ", array(
    ":sid"  => $sid
  ));
  return $stmt->fetch();
}
// UPDATE
function update_interests($sid, $interest)
{
  global $stmt;
  call_query("
    UPDATE interests
    SET interest = :interest
    WHERE sid = :sid
  ", array(
    ":sid"  => $sid,
    ":interest" => $interest
  ));
  return $stmt->fetch();
}

function insert_coursetaken(
  $student_id,
  $course_code
  )
{
  $sql = 'INSERT INTO courses_taken (sid, course_code)
  VALUES ($student_id, $course_code)';
  return call_query($sql);
}

// EXPERIENCES
// INSERT
function insert_experience(
  $student_id,
  $experience
  )
{
  return call_query(
    'INSERT INTO previous_experience (sid, experience)
    VALUES (:sid, :experience)',
    array(
      ":experience" => $experience,
      ":sid"        => $student_id
    )
  );
}
// FETCH
function fetch_experiences($sid)
{
  global $stmt;
  call_query("
    SELECT *
    FROM previous_experience
    WHERE sid = :sid
  ", array(
    ":sid"  => $sid
  ));
  return $stmt->fetch();
}
// UPDATE
function update_experience($sid, $experience)
{
  global $stmt;
  call_query("
    UPDATE previous_experience
    SET experience = :experience
    WHERE sid = :sid
  ", array(
    ":sid"  => $sid,
    ":experience" => $experience
  ));
  return $stmt->fetch();
}

// DURATION
// INSERT
function insert_duration(
  $student_id,
  $start_month,
  $end_month=null
  )
{
  return call_query(
    'INSERT INTO project_duration (sid, start_month, end_month)
    VALUES (:sid, STR_TO_DATE(:start_month, "%d/%m/%Y"), STR_TO_DATE(:end_month, "%d/%m/%Y"))',
    array(
      ":start_month"  => $start_month,
      ":end_month"    => $end_month,
      ":sid"          => $student_id
    )
  );

}
// FETCH
function fetch_duration($sid)
{
  global $stmt;
  call_query("
    SELECT *
    FROM project_duration
    WHERE sid = :sid
  ", array(
    ":sid"  => $sid
  ));
  return $stmt->fetch();
}
// UPDATE
function update_duration($sid, $start_month, $end_month=null)
{
  global $stmt;
  call_query("
    UPDATE project_duration
    SET start_month = STR_TO_DATE(:start_month, '%d/%m/%Y'), end_month = STR_TO_DATE(:end_month, '%d/%m/%Y')
    WHERE sid = :sid
  ", array(
    ":sid"  => $sid,
    ":start_month"  => $start_month,
    ":end_month"    => $end_month,
  ));
  return $stmt->fetch();
}


// TOKEN
// INSERT
function insert_token(
  $token_name,
  $token
  )
{
  return call_query(
    'INSERT INTO access_token (token_name, token)
    VALUES (:token_name, :token)',
    array(
      ":token_name" => $token_name,
      ":token"      => $token
    )
  );

}
// FETCH
function fetch_token($token_name)
{
  global $stmt;
  call_query("
    SELECT *
    FROM access_token
    WHERE token_name = :token_name
  ", array(
    ":token_name"  => $token_name
  ));
  return $stmt->fetch();
}
// UPDATE
function update_token($token_name, $token)
{
  global $stmt;
  call_query("
    UPDATE access_token
    SET token = :token
    WHERE token_name = :token_name
  ", array(
    ":token"  => $token,
    ":token_name"  => $token_name
  ));
  return $stmt->fetch();
}

function insert_skills(
  $student_id,
  $skills
  )
{
  $sql = 'INSERT INTO skills (sid, skill)
  VALUES ($student_id, $skills)';
  return call_query($sql);
}





$stmt = null;
function call_query($query, array $params = array())
{
  global $pdo;
  global $stmt;
	try {
		if($pdo !== null)
			if(($stmt = $pdo->prepare($query,
          array(
              PDO::ATTR_CURSOR  => PDO::CURSOR_FWDONLY
          )
        )) !== false)
        if(bindValue($params))
					if($stmt->execute())
            return true;
    return false;
  } catch (PDOException $e){
    exit($e);
  }
}

function bindValue(array $params = array()) {
  global $stmt;
  foreach($params as $v => $k)
    if(gettype($k) == "integer")
      $stmt->bindValue($v, $k, PDO::PARAM_INT);
    elseif(gettype($k) == "null")
      $stmt->bindValue($v, $k, PDO::PARAM_NULL);
    else
      $stmt->bindValue($v, $k, PDO::PARAM_STR);
  return true;
}
