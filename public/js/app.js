var url;
function createTimeline(query) {
    $('.loader').show()
    $("html,body").animate({ scrollTop: "60px"},200);
    $('.ex-wrapper').hide();
    $.get( "/create?query=" + query, function( res ) {
      data = res.data;
      if(window.location.hostname == 'localhost'){
        url = 'localhost:3000/timeline/' + res.id;
        $('#url').html(url);
      }else{
        url = window.location.hostname + '/timeline/' + res.id;
        $('#url').html(url);
      }

      $("#openNew").attr('href', url);

      var timeline = new TL.Timeline('timeline', data, {
        ga_property_id: "UA-27829802-4"
      });

      $('.loader').hide()
      $('.ex-wrapper').hide();
      $("#timeline-header").html('');
      $('#timeline-header').show();
      $("#timeline-header").append("<div id='t-header' >Timeline For <span>#" + query + "</span></div>");

      $("html,body").animate({ scrollTop: "640px"},1200);
      $('#urlbox').show();
    });
}
//
// $('#openNew').click(function(){
//   // window.open(url);
//
// });
