var callback = function () {
  // Handler when the DOM is fully loaded
  // wait for images to be downloaded and start the animation
  //   window.onload = function () {
  //     new Glider(document.querySelector(".glider"), {
  //       slidesToShow: 1,
  //       draggable: false,
  //       arrows: {
  //         prev: ".glider-prev",
  //         next: ".glider-next",
  //       },
  //     });
  //   };

  function handleImagesLoadedState() {
    let $element = null; //
    var requestAnimationFrame =
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;

    var cancelAnimationFrame =
      window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    const totalFrames = 4;
    const animationDuration = 1300;
    const timePerFrame = animationDuration / totalFrames;
    let timeWhenLastUpdate;
    let timeFromLastUpdate;
    let frameNumber = 1;
    let myReq;

    function fetchElementParent($selectedElement) {
      return $selectedElement.closest("div").className.split(" ")[0];
    }

    function updateOpacity($elementList, $el, frameId) {
      const $selectedElement = document.querySelector(`.${$el}-${frameId}`);
      const parentElClassName = fetchElementParent($selectedElement);
      const $currentSlideElements = document.querySelectorAll(
        `.${parentElClassName} .${$el}`
      );
      // console.log(`.${parentElClassName} .${$el}-${frameId}`);
      // console.log({ $currentSlideElements });
      for (i = 0; i < $currentSlideElements.length; i++) {
        // console.log("opacity,frameId", 0, frameId);
        $currentSlideElements[i].style.opacity = 0;
      }
      $selectedElement.style.opacity = 1;
    }

    // 'step' function will be called each time browser rerender the content
    // we achieve that by passing 'step' as a parameter to 'requestAnimationFrame' function
    function step(startTime) {
      // 'startTime' is provided by requestAnimationName function, and we can consider it as current time
      // first of all we calculate how much time has passed from the last time when frame was update
      if (!timeWhenLastUpdate) timeWhenLastUpdate = startTime;
      timeFromLastUpdate = startTime - timeWhenLastUpdate;

      // then we check if it is time to update the frame
      if (timeFromLastUpdate > timePerFrame) {
        // hide all frames
        // and show the required one
        // console.log("element", $element);
        updateOpacity(
          document.querySelectorAll("." + $element),
          $element,
          frameNumber
        );

        // reset the last update time
        timeWhenLastUpdate = startTime;

        // then increase the frame number or reset it if it is the last frame
        if (frameNumber < totalFrames) {
          frameNumber = frameNumber + 1;

          if (!document.querySelector(`.${$element}-${frameNumber}`)) {
            frameNumber = frameNumber - 1;
          }
        }
      }

      myReq = requestAnimationFrame(step);
    }

    document.querySelectorAll(".animation-group").forEach((item) => {
      item.addEventListener("mouseenter", (event) => {
        //mouse enter
        event.preventDefault();
        event.stopImmediatePropagation();
        const group = event.currentTarget.dataset.group;
        $element = group;
        myReq = requestAnimationFrame(step);
      });

      item.addEventListener("mouseleave", (event) => {
        event.stopImmediatePropagation();
        $element = event.currentTarget.dataset.group;

        cancelAnimationFrame(myReq);
        //Reset
        frameNumber = 1;
        timeFromLastUpdate = 0;

        updateOpacity(
          document.querySelectorAll("." + $element),
          $element,
          frameNumber
        );
      });

      if (~item.className.baseVal.indexOf("-1")) {
        // console.log("opacity", 1);
        item.style.opacity = 1;
      }
    });
  }

  const images = document.querySelectorAll(".img-container svg");

  Promise.all(
    Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve(img.naturalHeight !== 0);
      return new Promise((resolve) => {
        img.addEventListener("load", () => resolve(true));
        img.addEventListener("error", () => resolve(false));
      });
    })
  ).then((results) => {
    if (results.every((res) => res)) {
      // console.log("all images loaded successfully");

      handleImagesLoadedState();

      new Glider(document.querySelector(".glider"), {
        slidesToShow: 1,
        draggable: false,
        arrows: {
          prev: ".glider-prev",
          next: ".glider-next",
        },
      });
    } else console.log("some images failed to load, all finished loading");
  });
};

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  callback();
} else {
  document.addEventListener("DOMContentLoaded", callback);
}

