/*
var generate = function(){
  $("#timeline-header").html('');
  $('#timeline-header').show();
  var tag = $('#at-input').val();
  tag = tag.substring(1);

  var timeline = new TL.Timeline('timeline', '/create?query=' + tag, {
    ga_property_id: "UA-27829802-4"
  });
  console.log('refreshed timeline');
  $('.ex-wrapper').hide();
  $("#timeline-header").append("<div>Timeline For <span>#" + tag + "</span></div>");
  $("html,body").animate({ scrollTop: "700px"},1200);
};

$('#at-btn').click(function(){
  generate();
});

$(document).keypress(function(e){
  if(e.which == 13) {
    generate();
  }
});
