document.addEventListener("DOMContentLoaded", function() {
  var h1 = document.querySelector('h1');
  var animatedText = document.querySelector('#animated-text');

  var options = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.1 
  };

  function handleIntersect(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
       
        h1.style.webkitAnimation = 'anim 1.2s ease-out forwards';
        h1.style.animation = 'anim 1.2s ease-out forwards';
      } else {
        
        h1.style.webkitAnimation = 'none';
        h1.style.animation = 'none';
      }
    });
  }

  var observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(h1);


  var typedOptions = {
    strings: ["DESIGNER", "DEVELOPER", "CREATIVE", "IMPULS"],
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 2000,
    startDelay: 500,
    showCursor: false,
    loop: false,
    onComplete: function() {
      animatedText.textContent = 'IMPULS';
    }
  };

  var typed;
  var observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0
  };

  var textObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        if (typed) {
          typed.destroy(); 
        }
        typed = new Typed("#animated-text", typedOptions); 
      }
    });
  }, observerOptions);

  textObserver.observe(animatedText);


  $('.hero-down').mousedown(function() {
    gsap.fromTo('.btn-react', { opacity: 0, scale: 0 }, { opacity: 0.25, scale: 1, duration: 0.25, onComplete: function() {
      gsap.to('.btn-react', { opacity: 0, scale: 0, duration: 0.25 });
    }});
  });


  $('a[href*="#"]').not('a[href="#"]').click(function(event) {
    event.preventDefault();
    var target = this.hash;
    var $target = $(target);

    if ($target.length) {
      $('html, body').stop().animate({
        scrollTop: $target.offset().top
      }, 1000, 'swing', function() {
        window.location.hash = target;
      });
    }
  });
});


const icons = document.querySelectorAll('.icon');
const title = document.getElementById('blue-title');
const content = document.getElementById('blue-content');
const dots = document.querySelectorAll('.dot');
const nextButton = document.querySelector('.control.next');
const prevButton = document.querySelector('.control.prev');
const iconsWrapper = document.querySelector('.icons-wrapper');
const iconsContainer = document.querySelector('.icons');

let activeIndex = 0;

function isMobileView() {
return window.innerWidth < 768; 
}


function toggleCarousel() {
if (!isMobileView()) {
  
  nextButton.style.display = 'none';
  prevButton.style.display = 'none';
  iconsWrapper.style.overflow = 'visible'; 
} else {

  nextButton.style.display = 'flex';
  prevButton.style.display = 'flex';
  iconsWrapper.style.overflow = 'hidden'; 
}
}


icons.forEach((icon, index) => {
icon.addEventListener('click', () => {
  updateContent(index);
});
});


nextButton.addEventListener('click', () => {
if (isMobileView()) {
  activeIndex = (activeIndex + 1) % icons.length;
  updateContent(activeIndex);
  updateScroll();
}
});

prevButton.addEventListener('click', () => {
if (isMobileView()) {
  activeIndex = (activeIndex - 1 + icons.length) % icons.length;
  updateContent(activeIndex);
  updateScroll();
}
});


dots.forEach((dot, index) => {
dot.addEventListener('click', () => {
  updateContent(index);
  if (isMobileView()) {
    updateScroll();
  }
});
});


function updateContent(index) {
activeIndex = index;

const icon = icons[activeIndex];
title.textContent = icon.getAttribute('data-title');
content.textContent = icon.getAttribute('data-content');

dots.forEach((dot, i) => {
  dot.classList.toggle('active', i === activeIndex);
});


icons.forEach((icon) => {
  icon.classList.remove('active');
});


icons[activeIndex].classList.add('active');
}


function updateScroll() {
if (!isMobileView()) return; 

const visibleIcons = 3; 
const iconWidth = 90; 
const containerWidth = visibleIcons * iconWidth;

const maxScrollLeft = iconsContainer.scrollWidth - containerWidth;
const newScrollLeft = activeIndex * iconWidth - (containerWidth - iconWidth) / 2;

iconsWrapper.scrollTo({
  left: Math.min(Math.max(newScrollLeft, 0), maxScrollLeft),
  behavior: 'smooth',
});
}


window.addEventListener('resize', toggleCarousel);


toggleCarousel();














