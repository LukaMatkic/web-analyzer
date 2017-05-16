$(document).ready(function(){

  $('form').on('submit', function(){

      var item = $('form input');
      var scrap = {item: item.val()};

      $.ajax({
        type: 'POST',
        url: '/scrap',
        data: scrap,
        success: function(data){
          //do something with the data via front-end framework
          location.reload();
        }
      });

      return false;

  });



});
