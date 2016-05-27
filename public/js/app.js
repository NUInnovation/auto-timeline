var url;
function createTimeline(query) {
    $('.ex-wrapper').hide();
    $.get( "/create?query=" + query, function( res ) {
      data = res.data;
      // if(window.location.hostname == 'localhost'){
      //   url = 'localhost:3000/timeline/' + res.id;
      //   $('#url').html(url);
      // }else{
      //   url = window.location.hostname + '/timeline/' + res.id;
      //   $('#url').html(url);
      // }
      $('#url').val("  "+window.location.hostname + ":3000" + '/timeline/' + res.id);

      $("#openNew").attr('href', url);

      var timeline = new TL.Timeline('timeline', data, {
        ga_property_id: "UA-27829802-4"
      });

      console.log('creating timeline');

      $('.ex-wrapper').hide();
      $("#timeline-header").html('');
      $('#timeline-header').show();
      $("#timeline-header").append("<div id='t-header' >Timeline For <span>#" + query + "</span></div>");

      $("html,body").animate({ scrollTop: "700px"},1200);
      $('#urlbox').show();
    });
}
//
// $('#openNew').click(function(){
//   // window.open(url);
//
// });
