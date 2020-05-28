const BLANK_INPUT = {
  name: "",
  email: "",
  url: "",
  message: "",
};

function count(quantity, singular, plural) {
  if (quantity === 1) {
    return `${quantity} ${singular}`;
  } else {
    return `${quantity} ${plural}`;
  }
}

function hideIsoDate() {
  const timestamps = document.querySelectorAll(".timestamp");
  timestamps.forEach((ts) => {
    const absolute = ts.querySelector(".absolute");
    if (absolute) {
      ts.style.transform = `translateX(${absolute.offsetWidth}px)`;
      ts.addEventListener("mouseenter", () => {
        ts.style.transform = `translateX(0)`;
      });
      ts.addEventListener("mouseleave", () => {
        ts.style.transform = `translateX(${absolute.offsetWidth}px)`;
      });
    }
  });
}

hideIsoDate();

var app = new Vue({
  el: "#app",
  data: {
    input: JSON.parse(JSON.stringify(BLANK_INPUT)),

    dynamicGuestbook: [],
    getEntriesState: "loading", // "loading" || "error" || "success"
    formSubmissionState: "", // "" || "loading" || "error" || "success"
    formSubmissionErrorMessage: "",
  },
  computed: {
    header: function () {
      if (this.getEntriesState === "loading") {
        return "Fetching newest entries...";
      } else if (this.getEntriesState === "error") {
        return "Error fetching entries. Please tweet at me.";
      } else if (this.getEntriesState === "success") {
        return count(
          this.dynamicGuestbook.length +
            (typeof staticLength === "number" ? staticLength : 0),
          "entry",
          "entries"
        );
      }
    },
  },
  methods: {
    submitForm: function () {
      let validation = this.formIsValid();
      if (validation.error) {
        this.showFormErrorState(validation);
        return;
      }

      this.formSubmissionState = "loading";
      this.input["date"] = Date.now();

      axios
        .post(
          "https://vipqpoael1.execute-api.us-west-1.amazonaws.com/prod",
          this.input
        )
        .then((response) => {
          this.formSubmissionState = "success";
          this.dynamicGuestbook.unshift(this.input);
          this.input = JSON.parse(JSON.stringify(BLANK_INPUT));
        })
        .catch((err) => {
          this.formSubmissionState = "error";
          this.formSubmissionErrorMessage = err.response.data.errorMessage;
        });
    },

    formIsValid: function () {
      return true;
    },

    showFormErrorState: function () {
      return;
    },

    toIso: function (date) {
      return new Date(date).toISOString().split("T")[0];
    },

    relative: function (date) {
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
        fuzzy = "this week";
      } else if (delta < day * 14) {
        fuzzy = "last week";
      } else if (delta < day * 31) {
        fuzzy = "within a month";
      }

      return fuzzy || this.toIso(date);
    },
  },
  mounted() {
    axios
      .get("https://vipqpoael1.execute-api.us-west-1.amazonaws.com/prod")
      .then((response) => {
        this.getEntriesState = "success";
        this.dynamicGuestbook = response.data.filter(
          (e) => e.date > Date.parse(latestEntryDate)
        );
      })
      .catch((err) => {
        this.getEntriesState = "error";
      });
  },
  updated: function (params) {
    hideIsoDate();
  },

  filters: {
    toIso: function (date) {
      return this.app.toIso(date);
    },

    relative: function (date) {
      return this.app.relative(date);
    },
  },
});

Vue.config.errorHandler = (err, vm, info) => {
  vm.getEntriesState = "error";
  console.log(err);
};
