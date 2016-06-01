var url;
function createTimeline(query) {
    $('#spinner').css('display', 'inherit');
    $('.ex-wrapper').hide();
    $.get( "/create?query=" + query, function( res ) {
      data = res.data;
      if(data.events.length > 0) {
        if(window.location.hostname == 'localhost'){
          url = 'localhost:3000/timeline/' + res.id;
        }
        else{
          url = window.location.hostname + '/timeline/' + res.id;
        }

        $('#url').val("   " + url);

        $("#openNew").attr('href', url);

        var timeline = new TL.Timeline('timeline', data, {
          ga_property_id: "UA-27829802-4"
        });

        console.log('creating timeline');

        $('.ex-wrapper').hide();
        $('#spinner').hide();

        $("#timeline-header").html('');
        $('#timeline-header').show();
        $("#timeline-header").append("<div id='t-header' >Timeline For <span>#" + query + "</span></div>");
        $('.tl-text-content-container').find("h2").remove();
        $("html,body").animate({ scrollTop: "640px"},1200);
        $('#urlbox').show();
      }
      else {
        $('#spinner').hide();
        $("#timeline-header").html('');
        $('#timeline-header').show();
        $("#timeline-header").append("<div id='t-header'> Sorry! There Are No Recent Posts for <span>#" + query + "</span></div>");
      }
    });
}
//
// $('#openNew').click(function(){
//   // window.open(url);
//
// });
