function createTimeline(query) {
    $('.ex-wrapper').hide();
    $.get( "/create?query=" + query, function( res ) {
      data = res.data;
      $('#url').html(window.location.hostname + '/timeline/' + res.id);

      var timeline = new TL.Timeline('timeline', data, {
        ga_property_id: "UA-27829802-4"
      });

      $('.ex-wrapper').hide();
      $("#timeline-header").html('');
      $('#timeline-header').show();
      $("#timeline-header").append("<div id='t-header' >Timeline For <span>#" + query + "</span></div>");
      $('#openNew').click(function(){
        window.open('timeline.html');
      });

      $("#timeline-header").html('');
      $('#timeline-header').show();

      $("html,body").animate({ scrollTop: "700px"},1200);
      $('#urlbox').show();
    });



}
