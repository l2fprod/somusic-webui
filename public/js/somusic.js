// SOmusic.js
function queryParameters() {
  var result = {};
  var params = window.location.search.split(/\?|\&/);
  params.forEach(function (it) {
    if (it) {
      var param = it.split("=");
      result[param[0]] = param[1];
    }
  });
  return result;
};

function updateDates(previous, current, next) {
  var currentMoment = moment(current, "YYYY-MM-DD");

  $("#current").html("<div class=month>" + currentMoment.format("MMM") + "</div> <div class=day>" + currentMoment.format("D") + "</div>");
  $("#previous").attr("href", "?date=" + previous);
  $("#next").attr("href", "?date=" + next);

  $(document).bind('keydown', 'left', function () {
    location.href = "?date=" + previous;
  });
  $(document).bind('keydown', 'right', function () {
    location.href = "?date=" + next;
  });
};

$(document).ready(function () {
  var tileTemplate = Handlebars.compile($("#tile-template").html());

  $('[data-toggle="popover"]').popover()

  var params = queryParameters();
  console.log(params);

  $.get("api/1/ranking/" + (params.date ? params.date : "")).done(function (data) {
    updateDates(data.prev, data.current, data.next);

    var tilesContainer = $('#tiles');
    tilesContainer.empty();
    if (data.entries.length > 0) {
      $.each(data.entries, function (index, entry) {
        var element = tileTemplate(entry);
        tilesContainer.append(element);
      });

      $('#tiles').masonry({
        gutter: 0,
        itemSelector: '.tile',
        "isFitWidth": true
      });

    } else {
      tilesContainer.append('<div class="tiles-loading">Nothing yet for that day :(</div>');
    }
  });
});

// track scrolling and show header
var headerModified = false;
$(document).scroll(function () {
  if (!headerModified && $(this).scrollTop() > 10) {
    $("#header").addClass("header-scrolled");
    headerModified = true;
  } else if ($(this).scrollTop() < 10) {
    $("#header").removeClass("header-scrolled");
    headerModified = false;
  }
});
