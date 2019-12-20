// Templates

const template_top = ({
  teacher_name,
  teacher_id,
  nice_name,
  searching_for_students,
  interest_checkbox,
  keywords,
  soft_requirements,
  skills_id,
  match_score,
  match_score_filt,
  start_date,
  end_date,
  interests,
  interest_id,
  courses_taught,
  courses
}) => `
<div class="ui top attached segment"
  data-teacher="${nice_name}"
  data-teacher-id="${teacher_id}"
  data-courses=""
  penalty=""
  data-searching_for_students="${searching_for_students}"
  data-interest-checkbox="${interest_checkbox}"
  data-keywords="${keywords}"
  count-projects="0"
  skills=""
  start_date="${start_date}"
  end_date="${end_date}"
  skills-id="${skills_id}"
  interests="${interests}"
  interest_id="${interest_id}"
  courses-id="${courses_taught}"
  courses="${courses}"
  data-soft-requirements="${soft_requirements}">
  <div class="ui yellow image label right floated matches" tabindex="0">
    <b>Match</b> <div class="match detail" data-score="${match_score_filt}">${match_score}</div>
  </div>
  <a class="ui teal image label">Supervisor <div class="detail">${teacher_name}</div></a>
</div>
<div class="ui styled fluid accordion attached" data-teacher-load="${nice_name}"></div>`;

const template_content = ({
  title,
  content,
  date
}) => `
<div class="title ui clearing">
  <i class="dropdown icon"></i> ${title}
</div>
<div class="content">
  <p>${content}</p>
  <div class="ui divider"></div>
  <div class="ui attached clearing">
    <a class="ui blue image label">
      Duration <div class="detail">${date}</div>
    </a>
    <button class="teal compact ui right labeled icon button right floated application" data-apply="${title}"> <i class="right arrow icon"></i> Send an application</button>
  </div>
</div>`;

const courses_taken = ({
  course_name
}) => `<div class="ui attached segment menu-button" data-name="${course_name}"><i class="check icon"></i> ${course_name}</div>`;


// General functions

function getMonths(date) {
  if (date !== null) {
    var date = new Date(date);
    var month = date.toLocaleString('default', {
      month: 'long'
    });
    var monthNum = date.toLocaleString('default', {
      month: 'numeric'
    });
    return {
      "month": month,
      "numeric": monthNum
    };
  }
  return {
    "month": "",
    "numeric": ""
  };
}

function getYears(date) {
  if (date !== null) {
    var date = new Date(date);
    var year = date.toLocaleString('default', {
      year: 'numeric'
    });
    return year;
  }
  return;
}

function getInfoDate(date) {
  var month = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

  return {
    "day": new Date(date).getDate(),
    "year": new Date(date).getFullYear(),
    "month": month[new Date(date).getMonth()]
  };
}




$(document).ready(function() {

  //  Calendar for hard requirements
  
  var stop_date = new Date();
  $('#start_calendar').calendar({
    type: 'date',
    formatter: {
      date: function(date, settings) {
        if (!date) return '';
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        stop_date = new Date(year, month, day);
        return day + '/' + month + '/' + year;
      }
    },
    onChange(date, text, mode) {


      $('#stop_calendar').calendar({
        type: 'date',
        minDate: new Date(stop_date.getFullYear(), stop_date.getMonth() - 1, parseInt(stop_date.getDate()) + 150),
        formatter: {
          date: function(date, settings) {
            if (!date) return '';
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            return day + '/' + month + '/' + year;
          }

        },
        startCalendar: $('#start_calendar')
      });

    },
    endCalendar: $('#stop_calendar')
  });


  if ($('#stop_calendar')[0])
    $('#stop_calendar').calendar({
      type: 'date',
      minDate: new Date(stop_date.getFullYear(), stop_date.getMonth() - 1, parseInt(stop_date.getDate()) + 150),
      formatter: {
        date: function(date, settings) {
          if (!date) return '';
          var day = date.getDate();
          var month = date.getMonth() + 1;
          var year = date.getFullYear();
          return day + '/' + month + '/' + year;
        }

      },
      startCalendar: $('#start_calendar')
    });

  $('.ui.dropdown').dropdown({
    allowAdditions: true,
  });

  // Fetch queries and inject in page
  
  $.get("fetch_values.php?page=experiences", function(data) {
    if (data.length != 0)
      $('.ui.dropdown.previous_experiences').dropdown('set selected', JSON.parse(data));
  });
  
  $.get("fetch_values.php?page=interests", function(data) {
    if (data.length != 0)
      $('.ui.dropdown.interests').dropdown('set selected', JSON.parse(data));
  });
  
  $.get("fetch_values.php?page=project_duration", function(data) {
    if (data.length != 0) {
      var parse = JSON.parse(data);
      $('.ui.dropdown.start_month').dropdown('set selected', parse['start_month']);
      if (parse['end_month'] !== null) {
        $('.ui.dropdown.end_month .menu').prepend('<div class="item" data-value="0">Reset End Month</div>');
        $('.ui.dropdown.end_month').dropdown('set selected', parse['end_month']);
      } else
        $('.ui.dropdown.end_month').dropdown('set selected', parse['end_month']);
    }
  });

  $(".ui.accordion").accordion({
    "exclusive": false
  });

  // Load all projects
  if ($(".project")[0]) {
    $.get("directus_load.php?page=projects", function(data) {

      // loop through projects
      $.each(data["data"], function(e, y) {
        if (y.role !== "3") return;
        // check if teacher exists
        var teacher_name = y.first_name + ' ' + y.last_name;
        var nice_name = teacher_name.replace(/ /gi, "_");

        var teacher_exists = false;
        $(".project_list > div.top.attached.segment").each(function() {
          if ($(this).data("teacher") == nice_name) {
            teacher_exists = true;
          }
        });

        // Inject projects in page
        if (!teacher_exists) {
          $(".project_list").prepend([{
            teacher_name: teacher_name,
            teacher_id: y.user_id,
            nice_name: nice_name,
            searching_for_students: y.searching_for_students,
            interest_checkbox: y.interest_checkbox,
            keywords: y.keywords,
            soft_requirements: y.soft_requirements,
            skills_id: y.skills_id,
            match_score: "!",
            match_score_filt: -1,
            start_date: y.availability_start,
            end_date: y.availability_stop,
            interests: "",
            interest_id: y.interest_id,
            courses_taught: y.courses_taught,
            courses: ""
          }].map(template_top).join(''));
        }

        var startM = getMonths(y.availability_start)
        var stopM = getMonths(y.availability_stop)

        var stopY = getYears(y.availability_stop)
        var startY = getYears(y.availability_start)

        var calculate_months = "";
        
        // Calculate the months
        if (stopM["numeric"] - startM["numeric"] > 0) {
          if(startY !== stopY)
            calculate_months += Math.abs(parseInt(stopY)-parseInt(startY))+" year and ";
          calculate_months += (parseInt(stopM["numeric"]) - parseInt(startM["numeric"]));
        } else {

          calculate_months += 12-Math.abs(parseInt(stopM["numeric"]) - parseInt(startM["numeric"]));
        }

        display_months = startM["month"] + ' - ' + stopM["month"] + ' (' + calculate_months + ' months)';
        if (y.availability_start === null && y.availability_stop === null)
          display_months = "Unspecified";

        if (y.project_name !== null) {
          $(".project_list [data-teacher-load=" + nice_name + "]").prepend([{
            title: y.project_name,
            content: y.description,
            date: display_months
          }].map(template_content).join(''));

          $(".project_list [data-teacher=" + nice_name + "]").attr("count-projects", parseInt($(".project_list [data-teacher=" + nice_name + "]").attr("count-projects")) + 1);
        }
        $(".ui.accordion").accordion({
          "exclusive": false
        });
      });

      // fetch skills
      $.get("directus_load.php?page=requirements_list", function(data) {
        $.each(data["data"], function(e, y) {
          $(".project_list [data-teacher]").each(function(a, b) {
            if ($(b).attr("skills-id") === y.requirements_id)
              $(b).attr("skills", y.skills_text + "," + $(b).attr("skills"));
          })
        });
      });
      
      $.get("directus_load.php?page=requirements", function(data) {
        var concat_skills = [];
        $(".project_list [data-teacher]").each(function(t, u) {
          if($(u).attr("skills") !== "") {
            new_arr = $(u).attr("skills").split(",");
            new_arr.pop()
            concat_skills = concat_skills.concat(new_arr);
          }
        })
        $.each(data["data"], function(a, b) {
          if($.inArray(b.skills_text, concat_skills) !== -1)
            $(".student_skills").after([{
              course_name: b.skills_text
            }].map(courses_taken).join(''));
        });
        $('.ui.menu-button').state();
      });

      // fetch courses
      $.get("directus_load.php?page=interests_list", function(data3) {
        $.each(data3["data"], function(e, y) {
          $(".project_list [data-teacher]").each(function(a, b) {
            if ($(b).attr("course_id") == y.interests_id)
              $(b).attr("interests", y.interest_text + "," + $(b).attr("interests"));
          })
        });
      });

      $.get("directus_load.php?page=course_list", function(data3) {
        $.each(data3["data"], function(e, y) {
          $(".project_list [data-teacher]").each(function(a, b) {
            if ($(b).attr("courses-id") == y.courses_taught_id)
              $(b).attr("data-courses", y.course_name + "," + $(b).attr("data-courses"));
          })
        });
      });
      
      $.get("directus_load.php?page=all_courses", function(data) {
        var concat_course_taken = [];
        $(".project_list [data-teacher]").each(function(t, u) {
          if($(u).attr("data-courses") !== "") {
            new_arr = $(u).attr("data-courses").split(",");
            new_arr.pop()
            concat_course_taken = concat_course_taken.concat(new_arr);
          }
        })
        $.each(data["data"], function(a, b) {
          if($.inArray(b.course_name, concat_course_taken) !== -1)
            $(".courses_taken").after([{
              course_name: b.course_name
            }].map(courses_taken).join(''));
        });
        $('.ui.menu-button').state();
      });

      $.get("directus_load.php?page=courses_taught", function(data) {
        $(".select-course > div, .select-skills > div").on("click", function() {
          var courses_filtered = [];
          var skills_filtered = [];
          $(".select-course > div").each(function(r, t) {
            if ($(t).hasClass('active')) {
              courses_filtered.push($(t).data("name"));
            }
          });
          $(".select-skills > div").each(function(r, t) {
            if ($(t).hasClass('active')) {
              skills_filtered.push($(t).data("name"));
            }
          });

          var student_total = courses_filtered.concat(skills_filtered);

          $(".project_list [data-teacher]").each(function(a, b) {
            if ($(b).attr("data-courses").length > 0 || $(b).attr("skills").length > 0) {
              var course_names_per_teacher = $(b).attr("data-courses").split(",");
              var skills_per_teacher = $(b).attr("skills").split(",");
              var teacher_total = course_names_per_teacher.concat(skills_per_teacher);
              var course_exists = 0;
              var course_not_exists = 0;
              var not_match_suggest = [];
              var clean_teacher_total = $.map(teacher_total, $.trim).map(v => v.replace(/ /g, "_").toLowerCase());

              $(teacher_total).each(function(x, c) {
                if (c.length > 0) {
                  var index = $.inArray(c, student_total);

                  // skills students exists in teacher skills list
                  if (index != -1) {
                    course_exists += 1;

                  } else {
                    // kills students not exists in teacher skills list
                    course_not_exists += 1;
                    if ($.inArray(c.replace(/ /g, "_").toLowerCase(), clean_teacher_total) >= 0)
                      not_match_suggest.push(c);
                  }
                }
              });

              // calculate all courses
              var total_courses = [];
              $(".select-course > div").each(function(x, d) {
                if (typeof $(d).data("name") !== "undefined")
                  total_courses.push($(d).data("name"));
              });

              // calculate all skills
              var total_skills = [];
              $(".select-skills > div").each(function(x, d) {
                if (typeof $(d).data("name") !== "undefined")
                  total_skills.push($(d).data("name"));
              });

              var total_courses = $.map(total_courses, $.trim).map(v => v.replace(/ /g, "_").toLowerCase());
              var total_skills = $.map(total_skills, $.trim).map(v => v.replace(/ /g, "_").toLowerCase());
              var clean_not_match_suggest = $.map(not_match_suggest, $.trim).map(v => v.replace(/ /g, "_").toLowerCase());

              var missing_clean_course = [];
              var missing_clean_skills = [];
              $.each(not_match_suggest, function(x, d) {
                if ($.inArray(d.replace(/ /g, "_").toLowerCase(), total_courses) >= 0)
                  missing_clean_course.push(d);
              });

              $.each(not_match_suggest, function(x, d) {
                if ($.inArray(d.replace(/ /g, "_").toLowerCase(), total_skills) >= 0)
                  missing_clean_skills.push(d);
              });

              // suggestion text
              var suggested_text = "You are at least suggested to have ";
              if (missing_clean_course.length > 0)
                suggested_text += 'the following courses: <b class="ui label orange">' + [missing_clean_course.slice(0, -1).join('</b>, <b class="ui label orange">'), missing_clean_course.slice(-1)[0]].join(missing_clean_course.length < 2 ? '' : '</b> and <b class="ui label orange">') + '</b>';

              if (missing_clean_skills.length > 0) {
                if (missing_clean_course.length > 0) suggested_text += ", and ";
                suggested_text += ' the following <b>skills</b>: <b class="ui label orange">' + [missing_clean_skills.slice(0, -1).join('</b>, <b class="ui label orange">'), missing_clean_skills.slice(-1)[0]].join(missing_clean_skills.length < 2 ? '' : '</b> or <b class="ui label orange">') + '</b>';
              }

              // Calculate penalties
              // Fetch all penalties which are defined before in the code and calculate percentage.
              var penalty = $(b).attr("penalty").split(",").filter(Boolean);

              // when penalty is found, display error and provide ways how to improve
              if (penalty.length === 0)
                $("div[data-teacher=" + $(b).attr("data-teacher") + "]").each(function(o, p) {
                  var calc = course_exists / (course_exists + course_not_exists) * 100;
                  $(p).find(".match.detail").html(Math.round(calc) + "%").attr("data-score", Math.round(calc));
                  if (calc <= 65) {
                    if ($(p).find(".matches.label").hasClass("green"))
                      $(p).find(".matches.label").removeClass("green").addClass("yellow");
                    if ($("div[data-teacher-load=" + $(b).data("teacher") + "]").find('.warning.clear_warning').length === 0)
                      $("div[data-teacher-load=" + $(b).data("teacher") + "]").prepend('<div class="ui message warning clear_warning"><div class="content"> <i class="attention sign icon"></i> ' + suggested_text + ' </div></div>');
                    else
                      $("div[data-teacher-load=" + $(b).data("teacher") + "] .warning.clear_warning").html('<div class="content"> <i class="attention sign icon"></i> ' + suggested_text + ' </div>');
                  } else {
                    if ($(p).find(".matches.label").hasClass("yellow"))
                      $(p).find(".matches.label").removeClass("yellow").addClass("green");
                    $("div[data-teacher-load=" + $(b).data("teacher") + "] .warning.clear_warning").remove();
                  }
                })
            }

            if (student_total.length <= 0) {
              $("div[data-teacher=" + $(b).attr("data-teacher") + "]").each(function(o, p) {
                if ($(p).find(".matches.label").hasClass("green"))
                  $(p).find(".matches.label").removeClass("green").addClass("yellow");
                $(p).find(".match.detail").html("!").attr("data-score", -1);
                $("div[data-teacher-load=" + $(b).data("teacher") + "] .warning.clear_warning").remove();
              })
            }
          });

          var previous = 0;
          var name_previous = "";
          var sort_teacher_obj = {};

          delete sort_teacher_obj;
          $(".project_list [data-teacher]").each(function(a, b) {
            var score = $(b).find(".matches .detail").attr("data-score");
            var teacher_name = $(b).data("teacher");

            if (typeof score !== "undefined")
              sort_teacher_obj[teacher_name] = parseInt(score);
          });

          var sortable = [];
          for (var sorted_object in sort_teacher_obj) {
            sortable.push([sorted_object, sort_teacher_obj[sorted_object]]);
          }

          sortable.sort(function(a, b) {
            return a[1] - b[1];
          });

          for (var sorted_format in sortable) {
            var attr_sort = $(".project_list [data-teacher=" + sortable[sorted_format][0] + "]")

            $(".project_list").prepend(attr_sort);

            $(".project_list [data-teacher-load=" + sortable[sorted_format][0] + "]").each(function(c, d) {
              $(".project_list [data-teacher=" + sortable[sorted_format][0] + "]").after(d);

            });
          }
        });

        // Calculate overlap days
        function dateRangeOverlaps(t_start, t_end, s_start, s_end) {
          var min_end = Math.min(t_end, s_end);
          var max_start = Math.max(t_start, s_start);
          var calc_date = (Math.max(min_end - max_start + 1, 0));
          return Math.round((new Date(calc_date) - new Date(0)) / 1000 / 86400)
        }

        function split_date(dates) {
          return dates.split("-");
        }

        // filter system
        $(".project_list [data-teacher]").each(function(a, b) {
          if ($(b).attr("start_date") !== "null") {
            var teacher_start = $(b).attr("start_date");
            var teacher_stop = $(b).attr("end_date");
            var student_start = $(".info").attr("start-month");
            var student_stop = $(".info").attr("end-month");

            var overlap_days = (dateRangeOverlaps(
              new Date(split_date(teacher_start)),
              new Date(split_date(teacher_stop)),
              new Date(split_date(student_start)),
              new Date(split_date(student_stop))
            ));

            $(b).attr("overlap_days", overlap_days);

            // Overlap days less than 150?
            if (overlap_days < 150) {
              $(b).css("background-color", "#fff6f6");
              $(b).attr("penalty", "short_overlap_days," + $(b).attr("penalty"))
              $(b).find(".match.detail").html("");
              $(b).find(".match.detail").parent().removeClass("green").removeClass("yellow").addClass("red");
              $(b).find(".matches").html("Mismatch");
              $("div[data-teacher-load=" + $(b).data("teacher") + "] .application").each(function(o, b) {
                $(b).remove(".application");
              });

              var s_date = getInfoDate($(b).attr("start_date"));
              var e_date = getInfoDate($(b).attr("end_date"));

              var suggestion_teacher = 'from ' + s_date.day + ' ' + s_date.month + ' ' + s_date.year;
              suggestion_teacher += ' until ' + e_date.day + ' ' + e_date.month + ' ' + e_date.year;

              $("div[data-teacher-load=" + $(b).data("teacher") + "]").prepend('<div class="ui message error clear_warning"><div class="content"> <i class="warning sign icon"></i> Supervisor is not available for the given date. Teacher is possible to take students ' + suggestion_teacher + '</div></div>');
            }
          }
        });

        $(".project_list [data-teacher]").each(function(a, b) {

          // Searching for students
          if ($(b).attr("data-searching_for_students") !== "1") {
            $(b).css("background-color", "#fff6f6");
            $(b).attr("penalty", "teacher-not-searching_for_students," + $(b).attr("penalty"))

            var teacher_temp = $(b).attr("data-teacher");

            $("div[data-teacher=" + teacher_temp + "]").each(function(o, p) {
              $(p).find(".match.detail").html("");
              $(p).find(".match.detail").parent().removeClass("green").removeClass("yellow").addClass("red");
              $(p).find(".matches").html("Mismatch");
              $("div[data-teacher-load=" + teacher_temp + "]").prepend('<div class="ui message error clear_warning"><div class="content"><i class="warning sign icon"></i> Supervisor is not looking for students</div></div>');
              $("div[data-teacher-load=" + teacher_temp + "] .application").each(function(o, b) {
                $(b).remove(".application");
              });
            })
          }

          // Interest
          if ($(b).attr("interests") !== "null") {
            var interests_list_info = $(b).attr("interests");
            var student_interests = $(".info").attr("interests");


            if (typeof interests_list_info !== "undefined" && interests_list_info !== "" && student_interests !== ",") {
              interests_list_info = interests_list_info.split(",");
              student_interests = student_interests.split(",");

              interests_list_info.pop();
              student_interests.pop();

              var answers = student_interests,
                correctAnswers = interests_list_info,
                count = 0,
                percent;

              var cleananswers = $.map(answers, $.trim).map(v => v.replace(/ /g, "_").toLowerCase());
              var not_match_name = [];
              correctAnswers.forEach(function(c) {
                if (answers.some(function(a) {
                    return a === c;
                  })) {
                  count++;
                }

                if ($.inArray(c.replace(/ /g, "_").toLowerCase(), cleananswers) < 0)
                  not_match_name.push(c);
              });

              percent = count * 100 / correctAnswers.length;
              $(b).attr("interest_match_score", percent.toFixed(2));
              $(b).attr("not_match_interest", not_match_name);

              if (percent.toFixed(2) < 45) {

                $(b).css("background-color", "#fff6f6");
                $(b).attr("penalty", "teacher-not-searching_for_students," + $(b).attr("penalty"))

                var teacher_temp = $(b).attr("data-teacher");

                $("div[data-teacher=" + teacher_temp + "]").each(function(o, p) {
                  $(p).find(".match.detail").html("");
                  $(p).find(".match.detail").parent().removeClass("green").removeClass("yellow").addClass("red");
                  $(p).find(".matches").html("Mismatch");
                  $("div[data-teacher-load=" + teacher_temp + "]").prepend('<div class="ui message error clear_warning"><div class="content"><i class="warning sign icon"></i> Low interest score, you need to have interest for at least: <b>' + [not_match_name.slice(0, -1).join('</b>, <b>'), not_match_name.slice(-1)[0]].join(not_match_name.length < 2 ? '' : '</b> or <b>') + '</b></div></div>');
                  $("div[data-teacher-load=" + teacher_temp + "] .application").each(function(o, b) {
                    $(b).remove(".application");
                  });
                })
              }
            }
          }
        });

        // sort
        // All teachers with projects first
        $(".project_list [data-teacher]").each(function(a, b) {
          if ($(b).attr("count-projects") > 0) {
            $(".project_list").prepend(b);
            $(".project_list [data-teacher-load=" + $(b).attr("data-teacher") + "]").each(function(c, d) {
              $(".project_list [data-teacher=" + $(b).attr("data-teacher") + "]").after(d);
            });
          }

        });

        // All non penalty first
        $(".project_list [data-teacher]").each(function(a, b) {
          if ($(b).attr("penalty") === "") {
            $(".project_list").prepend(b);
            $(".project_list [data-teacher-load=" + $(b).attr("data-teacher") + "]").each(function(c, d) {
              $(".project_list [data-teacher=" + $(b).attr("data-teacher") + "]").after(d);
            });
          }
        });

        var penalty_seen = false;
        var penalty_number = -1;
        $(".project_list [data-teacher]").each(function(a, b) {
          if (!penalty_seen)
            penalty_number = a;
          if ($(b).attr("penalty").length > 0) penalty_seen = true;
        });

        $(".project_list [data-teacher]").each(function(a, b) {
          if (penalty_number === a)
            $(".project_list [data-teacher=" + $(b).attr("data-teacher") + "]").before('<h4 class="ui horizontal divider header">Mismatches</h4>');
        });

      });
    });
  }
  $(".project_list").on("click", "button.compact[data-apply]", function() {
    $('.modal').modal('show');
  });
});
