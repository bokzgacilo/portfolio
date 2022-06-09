$(document).ready(function(){

  const soundpop = new Audio("pop.mp3");
  const calculatorPage = "page/calculator.html";
  const loginPage = "page/loginPage.html";
  const taskPerformancePage = "page/TaskPerformance/index.html";
  const activityonePage = "page/activityone.html";
  const activitytwoPage = "page/activitytwo.html";
  const taskPerformance1Page = "page/tp1/index.html";
  const taskPerformance3Page = "page/tp3/index.html";

  $('.work').click(function(event){
    soundpop.play();

    switch(event.target.id){
      case "calculator":
        window.setTimeout(function(){
          location.href = calculatorPage;
        }, 250)
        break;
      case "login-form":
        window.setTimeout(function(){
          location.href = loginPage;
        }, 250)
        break;
      case "taskperformance":
        window.setTimeout(function(){
          location.href = taskPerformancePage;
        }, 250)
        break;
      case "activityone":
        window.setTimeout(function(){
          location.href = activityonePage;
        }, 250)
        break;
      case "activitytwo":
        window.setTimeout(function(){
          location.href = activitytwoPage;
        }, 250)
        break;
      case "taskperformance1":
        window.setTimeout(function(){
          location.href = taskPerformance1Page;
        }, 250)
        break;
      case "taskperformance3":
        window.setTimeout(function(){
          location.href = taskPerformance3Page;
        }, 250)
        break;
      default:
        
    }
  })

  // POPUP
  $('.contactme').click(function(){
    var popup = document.getElementById("myPopup");
    setTimeout(function() {
      document.getElementById("myPopup").classList.toggle("show");
  }, 200);
  })

  // MY INFO SIDEBAR
  $('.my-name').click(function(){
    $("#mySidebar").width(500);
    $("#main").marginLeft(250);
  })

  $('.closebtn').click(function(){
    $("#mySidebar").width(0);
    $("#main").marginLeft(0);
  })


  // SOCIAL MEDIA
  // linkend
  // twitter
  // google
  // facebook
  $('.socialmedia-icons').click(function(){
    // alert(this.id)
    switch(this.id){
      case 'facebook':
        window.open('https://www.facebook.com/borobokbok/','Facebook','width=600,height=768')
      break;
      case 'twitter':
        window.open('https://twitter.com/borobokbok','Twitter','width=600,height=768')
      break;
      // case 'google':
      //   window.open('bokzgacilo@gmail.com','Facebook','width=600,height=768')
      // break;
      case 'linkend':
        window.open('https://www.linkedin.com/in/ariel-jericko-g-881a06122/','LinkedIn','width=600,height=768')
      break;
      default:
    }

  })

})