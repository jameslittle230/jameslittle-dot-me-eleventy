const BLANK_INPUT = {
  name: "",
  email: "",
  url: "",
  message: "",
};

function count(quantity, singular, plural) {
  return `${quantity} ${quantity === 1 ? singular : plural}`;
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

    messageCharactersRemaining: function () {
      return 350 - this.input.message.length;
    },

    messageCharactersRemainingText: function () {
      return this.messageCharactersRemaining < 50
        ? `${count(
            this.messageCharactersRemaining,
            "character",
            "characters"
          )} remaining`
        : "";
    },

    isFormSubmittable: function () {
      return (
        this.messageCharactersRemaining >= 0 &&
        this.input.name !== "" &&
        this.input.message !== ""
      );
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

      axios
        .post("https://api.jameslittle.me/guestbook", {
          ...this.input,
          qa: development !== "false" /* [1] */,
        })
        .then((response) => {
          this.formSubmissionState = "success";
          this.dynamicGuestbook.unshift({...this.input, created_at: new Date()});
          this.input = JSON.parse(JSON.stringify(BLANK_INPUT));
        })
        .catch((err) => {
          this.formSubmissionState = "error";
          this.formSubmissionErrorMessage = err.response.data.errorMessage;
        });

      /**
       * [1]: // Using !== here because it's safer than === -
       *      it'll always default to QA except in the one scenario where
       *      I don't want it to (in case `development` is null/not a string)
       */
    },

    formIsValid: function () {
      return true;
    },

    showFormErrorState: function () {
      return;
    },

    toIso: function (date) {
      return new Date(Number(date)).toISOString().split("T")[0];
    },

    relative: function (date) {
      date = new Date(Number(date));
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
        fuzzy = "this month";
      }

      return fuzzy || this.toIso(date);
    },
  },

  mounted() {
    document.querySelectorAll(".hidden-until-js-load").forEach((e) => {
      e.classList.remove("hidden-until-js-load");
    });

    document.querySelectorAll(".hidden-when-js-load").forEach((e) => {
      e.classList.add("hidden");
    });

    axios
      .get("https://api.jameslittle.me/guestbook")
      .then((response) => {
        var items = response.data["Items"]

        items.forEach(i => {
          i.created_at = new Date(Number(i.created_at))
        });

        this.dynamicGuestbook = response.data["Items"].filter(
          (i) => i.created_at > latestEntryDate
        );
        this.getEntriesState = "success";
      })
      .catch((err) => {
        console.error(err);
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
