const BLANK_INPUT = {
  name: "",
  email: "",
  url: "",
  message: ""
};

var app = new Vue({
  el: "#app",
  data: {
    input: JSON.parse(JSON.stringify(BLANK_INPUT)),

    guestbook: [],
    getEntriesState: "loading", // "loading" || "error" || "success"
    formSubmissionState: "", // "" || "loading" || "error" || "success"
    formSubmissionErrorMessage: ""
  },
  computed: {
    header: function() {
      return `${this.guestbook.length} message${this.guestbook.length == 1 ? '' : 's'}`;
    }
  },
  methods: {
    submitForm: function() {
      let validation = this.formIsValid();
      if (validation.error) {
        this.showFormErrorState(validation);
        return;
      }

      this.formSubmissionState = "loading"
      this.input["date"] = Date.now();

      axios
        .post(
          "https://vipqpoael1.execute-api.us-west-1.amazonaws.com/prod",
          this.input
        )
        .then(response => {
          this.formSubmissionState = "success";
          this.guestbook.unshift(this.input);
          this.input = JSON.parse(JSON.stringify(BLANK_INPUT));
        })
        .catch(err => {
          this.formSubmissionState = "error"
          this.formSubmissionErrorMessage = err.response.data.errorMessage;
        })
    },

    formIsValid: function() {
      return true;
    },

    showFormErrorState: function() {
      return;
    }
  },
  mounted() {
    axios
      .get("https://vipqpoael1.execute-api.us-west-1.amazonaws.com/prod")
      .then(response => {
        this.getEntriesState = "success";
        this.guestbook = response.data;
      })
      .catch(err => {
        this.getEntriesState = "error";
      });
  },
  updated: function(params) {
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
  },

  filters: {
    relative: function(date) {
      date = new Date(date);
      var delta = Math.round((+new Date() - date) / 1000);

      var minute = 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;

      var fuzzy = null;

      if (delta < 30) {
        fuzzy = "just now";
      } else if (delta < minute) {
        fuzzy = delta + " seconds ago";
      } else if (delta < 2 * minute) {
        fuzzy = "a minute ago";
      } else if (delta < hour) {
        fuzzy = Math.floor(delta / minute) + " minutes ago";
      } else if (Math.floor(delta / hour) == 1) {
        fuzzy = "1 hour ago";
      } else if (delta < day) {
        fuzzy = Math.floor(delta / hour) + " hours ago";
      } else if (delta < day * 2) {
        fuzzy = "yesterday";
      } else if (delta < day * 7) {
        fuzzy = "this week"
      } else if (delta < day * 14) {
        fuzzy = "last week"
      } else if (delta < day * 31) {
        fuzzy = "within a month"
      }

      return fuzzy || toIso(date);
    },

    toIso: function(date) {
      return new Date(date).toISOString().split("T")[0];
    }
  }
});