var app = new Vue({
  el: "#app",
  data: {
    guestbook: [
        {
            name: "James Little",
            url: "https://jameslittle.me",
            date: "2020-03-15",
            message: "asf asf asfd"
        }
    ]
  },
  computed: {
      message: function() {
          return `${this.guestbook.length} messages`
      }
  },
  updated: function(params) {
      console.log(7)
      const timestamps = document.querySelectorAll(".timestamp");
      timestamps.forEach(ts => {
        const absolute = ts.querySelector(".absolute");
        if (absolute) {
          ts.style.transform = `translateX(${absolute.offsetWidth}px)`;
        }
        ts.addEventListener("mouseenter", () => {
          ts.style.transform = `translateX(0)`;
        });
        ts.addEventListener("mouseleave", () => {
          ts.style.transform = `translateX(${absolute.offsetWidth}px)`;
        });
      });
  }
});

console.log("22")
