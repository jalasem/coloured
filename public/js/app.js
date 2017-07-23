$(document)
  .ready(function () {
    $('.featureAction_viewTable').click(function (e) {
      var sure = confirm("Sure to feature this Post?");
      if (sure) {
        var clickedPostID = e.currentTarget.parentElement.parentElement.id;
        $.ajax({
          type: 'POST',
          url: '/api/featurePost',
          data: {
           slug: clickedPostID
          },
          success: function (data) {
            Materialize.toast(JSON.stringify(data.message, undefined, 2), 3000, 'rounded');
            if(data.code == "OK")
              $('#tr' + clickedPostID).addClass('featured');
          },
          error: function (error) {
            Materialize.toast(JSON.stringify(error, undefined, 2), 3000, 'rounded');
            console.log(error);
          }
        });
      }
    });

    $('.unfeatureAction_viewTable').click(function (e) {
      var sure = confirm("Sure to unfeature this Post?");
      if (sure) {
        var clickedPostID = e.currentTarget.parentElement.parentElement.id;
        $.ajax({
          type: 'POST',
          url: '/api/unfeaturePost',
          data: {
           slug: clickedPostID
          },
          success: function (data) {
            Materialize.toast(JSON.stringify(data.message, undefined, 2), 3000, 'rounded');
            window.location.reload();
            if(data.code == "OK")
              $('#tr' + clickedPostID).addClass('featured');
          },
          error: function (error) {
            Materialize.toast(JSON.stringify(error, undefined, 2), 3000, 'rounded');
            console.log(error);
          }
        });
      }
    });



    $(".deleteAction_viewTable").click(function (e) {
      var sure = confirm("are you sure to delete this post?");
      if (sure) {
        var clickedPostID = e.currentTarget.parentElement.parentElement.id;

        var postCat = $("#" + clickedPostID + " .post-category-viewTable").text() || "General";

        $.ajax({
          type: 'DELETE',
          dataType: 'text',
          url: '/api/deletePost',
          data: {
            postID: clickedPostID,
            postCat: postCat
          },
          success: function () {
            $("#tr" + clickedPostID).remove();
            Materialize.toast("Post successfully deleted", 4000, "rounded");
            window.location.reload();
          },
          error: function (err) {
            Materialize.toast("there was an error deleteing this post!", 4000, 'rounded');
            console.log(err);
          }
        });
      }
    });

    $(".catsCont .delete").click(function(e){
      var sure = confirm("Are you sure to delete this category?");
      if(sure){
        var clicked = e.currentTarget.parentElement.id;
        var id = clicked.replace('del-','');

        $.ajax({
          type: 'DELETE',
          url: "/api/deleteCategory",
          data: {
            catname: id
          },
          success: function(data) {
            Materialize.toast(data.message, 3000);
            $(id).remove();
          },
          error: function(err) {
            Materialize('error', 3000, 'rounded');
          }
        });
      }
    });

    $('.newCatBtn').click(function(e){
      $('#create_catPop, #create_catPop .popup-overlay').removeClass('hide');
    });

    $('.catsCont .edit').click(function(e){
      var thisCat = e.currentTarget.id;
      thisCat = thisCat.replace('edit-', '');
      $('#oldName').text(thisCat);
      $('#Catname').val(thisCat);
      Materialize.updateTextFields();

      $('#edit_catPop, #edit_catPop .popup-overlay').removeClass('hide');
    });

    $(".deleteAction_viewTable").click(function (e) {
      var sure = confirm("are you sure to delete this post?");
      if (sure) {
        var clickedPostID = e.currentTarget.parentElement.parentElement.id;

        var postCat = $("#" + clickedPostID + " .post-category-viewTable").text() || "General"

        $.ajax({
          type: 'DELETE',
          dataType: 'text',
          url: '/api/delete/post',
          data: {
            postID: clickedPostID,
            postCat: postCat
          },
          success: function () {
            $("#tr"+clickedPostID).remove();
            Materialize.toast("Post successfully deleted", 4000, "rounded");
          },
          error: function (err) {
            Materialize.toast("there was an error deleteing this post!",4000, 'rounded');
            console.log(err);
          }
        });
      }
    });

    $('.card, .card-panel').addClass('hoverable');
    $(".button-collapse").sideNav();
    $(window).scroll(function () {
      if ($(window).scrollTop() > 300) {
        $('.nav-content').addClass('fixed');
        $('nav.nav-extended>.nav-wrapper').addClass('pinned');
      }
      if ($(window).scrollTop() < 301) {
        $('.nav-content').removeClass('fixed');
        $('nav.nav-extended>.nav-wrapper').removeClass('pinned');
      }
    });
    $('.collapsible').collapsible();
    $('select').material_select();
    $('.tooltipped').tooltip({delay: 50});
    $('.popup-overlay, .close-area, .close-btn').click(function () {
      $('.popup, .popup-overlay').addClass('hide');
    });
  });

$('#menuToggler').click(function () {
  $('aside').toggleClass('collapsed');
  $('main').toggleClass('expanded');
});

// EDITOR Scripts
tinymce.init({
  selector: '#postfullOnEditPop, #newPostFull,#aboutSite,#aboutAuthor',
  height: 200,
  menubar: false,
  plugins: [
    'advlist autolink lists link image charmap print,preview anchor ', ' searchreplace visualblocks code fullscreen ', 'insertdatetime media table contextmenu paste code'
  ],
  toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignrigh' +
      't alignjustify | bullist numlist outdent indent | link image ',
  content_css: ['//fonts.googleapis.com/css?family=Lato:300,300i,400,400i', '//www.tinymce.com/css/codepen.min.css']
});

var Upload = function (file) {
  this.file = file;
};

Upload.prototype.getType = function () {
  return this.file.type;
};
Upload.prototype.getSize = function () {
  return this.file.size;
};
Upload.prototype.getName = function () {
  return this.file.name;
};
Upload.prototype.doUpload = function () {
  var that = this;
  var formData = new FormData();

  $('button[type="submit"]').addClass('disabled');

  formData.append("file", this.file, this.getName());
  formData.append("upload_file", true);

  $.ajax({
    type: "POST",
    url: "/api/upload/image",
    xhr: function () {
      var myXhr = $
        .ajaxSettings
        .xhr();
      if (myXhr.upload) {
        myXhr
          .upload
          .addEventListener('progress', that.progressHandling, false);
      }
      return myXhr;
    },
    success: function (data) {
      // your callback here
      $("#progress-wrp").addClass("hide");
      Materialize.toast("Image Upload Successful", 3000);
      if(data !== "Error uploading to cloudinary"){
        $("#placeholdFeaturedImage").attr("src", data.result.secure_url);
        window.currentFeaturedImage = data.result;
      }
      $('button[type="submit"]').removeClass('disabled');
    },
    error: function (error) {
      $('button[type="submit"]').removeClass('disabled');
      // handle error
      console.log(error);
    },
    async: true,
    data: formData,
    cache: false,
    contentType: false,
    processData: false,
    timeout: 60000
  });
};

Upload.prototype.progressHandling = function (event) {
  var percent = 0;
  var position = event.loaded || event.position;
  var total = event.total;
  var progress_bar_id = "#progress-wrp";
  if (event.lengthComputable) {
    percent = Math.ceil(position / total * 100);
  }
  // update progressbars classes so it fits your code
  $(progress_bar_id).removeClass('hide');
  $(progress_bar_id + " .progress-bar").css("width", + percent + "%");
  $(progress_bar_id + " .status").text(percent + "%");
};

$("#ingredient_file").on("change", function (e) {
  var file = $(this)[0].files[0];
  var upload = new Upload(file);
  if (file) {
    Materialize.toast("uploading featured Image...", 4000);
    upload.doUpload();
  }

  // maby check size or type here with upload.getSize() and upload.getType()
  // execute upload
});

function truncate(str, num) {
    var truncd = '';
    if (str.length > num) {
        truncd = str.slice(0,num-3) + '...';
        return truncd;
    }
    return str;
}

function writeNewPost(){
  $('#NewPostForm i.newPostSpinner').removeClass("hide");
  var postImage = window.currentFeaturedImage || null;
  var postTitle  = $('#newPostTitle').val();
  var postDesc = $("#newPosDesc").val() || truncate(fullPost, 300);
  var postCat = $("#newPostCat").val() || null;
  var fullPost = tinymce.get('newPostFull').getContent();
  var published;
  if($('#newPostStatus').val() == "public"){
    published = true;
  } else {
    published = false;
  }

  $.ajax({
    type: "POST",
    url: "/api/createPost",
    data: {
      title: postTitle,
      description: postDesc,
      category: postCat,
      body: fullPost,
      media: postImage,
      published: published
    },
    success: function(data) {
      $('#NewPostForm i.newPostSpinner').addClass("hide");
      Materialize.toast(data.message, 3000, 'rounded');
      console.log(data);
    },
    error: function(err) {
      $('#NewPostForm i.newPostSpinner').addClass("hide");
      Materialize.toast(JSON.stringify(err), 6000);
      console.log(err);
    }
  });

  return false;
}

function writeEditPost(){
  $('#NewPostForm i.newPostSpinner').removeClass("hide");
  var postImage = window.currentFeaturedImage || null;
  var postTitle  = $('#newPostTitle').val();
  var postDesc = $("#newPosDesc").val() || truncate(fullPost, 300);
  var postCat = $("#newPostCat").val() || null;
  var fullPost = tinymce.get('newPostFull').getContent();
  var published;
  if($('#newPostStatus').val() == "public"){
    published = true;
  } else {
    published = false;
  }

  var toEditPostID = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];

  $.ajax({
    type: "POST",
    url: "/api/editPost/" + toEditPostID,
    data: {
      title: postTitle,
      description: postDesc,
      category: postCat,
      body: fullPost,
      media: postImage,
      published: published
    },
    success: function(data) {
      $('#NewPostForm i.newPostSpinner').addClass("hide");
      Materialize.toast(JSON.stringify(data.message), 3000, 'rounded');
      console.log(data);
    },
    error: function(err) {
      $('#NewPostForm i.newPostSpinner').addClass("hide");
      Materialize.toast(JSON.stringify(err), 6000);
      console.log(err);
    }
  });

  return false;
}

function writeSiteInfo(){
  $('#updateInfoSpinner').removeClass('hide');

  var aboutColoured = tinymce.get('aboutSite').getContent();
  var aboutAuthor = tinymce.get('aboutAuthor').getContent();

  var twUrl = $('#fbUrl').val();
  var fbUrl = $('#twUrl').val();
  var igUrl = $('#igUrl').val();

  $.ajax({
    type: "PATCH",
    url: "/api/metadata",
    data: {
      aboutColoured: aboutColoured,
      aboutAuthor: aboutAuthor,
      twUrl: twUrl,
      fbUrl: fbUrl,
      igUrl: igUrl
    },
    success: function(data){
      $('#updateInfoSpinner').addClass('hide');
      Materialize.toast("successfull!", 3000, 'rounded');
    },
    error: function(error){
      $('#updateInfoSpinner').addClass('hide');
      Materialize.toast('error updating site info', 4000);
    }
  });

  return false;
}

function createNewCat() {
  $('#create_catPop, #create_catPop .popup-overlay').addClass('hide');
  var catName = $('#newCat').val();

  $.ajax({
    type: 'PUT',
    url: '/api/editCategory',
    data: {
      name: catName
    },
    success: function(data){
      Materialize.toast("successfull!", 3000, 'rounded');
      window.location.reload();
    },
    error: function(error){
      Materialize.toast('error creating category', 4000);
    }
  });
  return false;
}

function editCat() {
  $('#edit_catPop, #edit_catPop .popup-overlay').addClass('hide');

  var newName = $('#Catname').val();
  var oldName = $('#oldName').text();

  $.ajax({
    type: 'PUT',
    url: "/api/editCategory",
    data: {
      name: oldName,
      newName: newName
    },
    success: function(data){
      Materialize.toast("successfull!", 3000, 'rounded');
      window.location.reload();
    },
    error: function(error){
      Materialize.toast('error creating category', 4000);
    }
  });
  return false;
}


function changepass(){
  console.log("attempt tp change password");
  return false;
}