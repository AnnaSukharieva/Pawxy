document.addEventListener(
  "DOMContentLoaded",
  () => {
    const apiKey = "AIzaSyCq1R5WJ4bSOpCJ2K2nEyRvlUDq_W9A8vM";
    const engineId = "4219ea527bf5a44fc";

    const elementForm = document.querySelector("#searchForm");
    const arrowPrev = document.querySelector(".pagination__arrow-prev");
    const arrowNext = document.querySelector(".pagination__arrow-next");
    const pageElement = document.querySelector(".pagination__number");
    const pagination = document.querySelector(".pagination");
    const googleLink = document.querySelector(".global-search__link");
    const preview = document.querySelector(".preview");

    let resultItems = [];
    let previewInfos = [];
    let paginationStart = 1;
    let currentPage = null;
    let nextPage = null;
    let query = "";
    let result = null;

    // preview.innerHTML = "";

    const changePage = async (num) => {
      paginationStart = paginationStart + num;
      await service();
      pageElement.innerHTML = `${currentPage}`;
      buttonsCheck();
    };

    arrowPrev.addEventListener("click", () => {
      changePage(-10);
    });

    arrowNext.addEventListener("click", () => {
      changePage(10);
    });

    elementForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(elementForm);
      query = formData.get("query");
      paginationStart = 1;
      !query ? (renderElem.innerHTML = `
      <div class="message">
			<div>There are no information yet. <br> Type something to search</div>
		</div>
      `) : await service();
      googleLink.href = `https://www.google.com/search?q=${query}`;
      googleLink.innerHTML = `<div> Search <b>${query}</b> on Google </div>`;
      if (pagination.classList.contains("hide")) {
        pagination.classList.remove("hide");
      }
      buttonsCheck();
    });

    const loadClient = () => {
      gapi.client.setApiKey(apiKey);
      return gapi.client
        .load(
          "https://content.googleapis.com/discovery/v1/apis/customsearch/v1/rest"
        )
        .then(
          () => {
            console.log("GAPI client loaded for API");
          },
          (err) => {
            console.error("Error loading GAPI client for API", err);
          }
        );
    };

    const service = async () => {
      await loadClient();
      return gapi.client.search.cse
        .list({
          cx: engineId,
          q: query,
          sort: "review-rating:d:s",
          hq: "music",
          siteSearchFilter: "i",
          siteSearch: "youtube.com/watch?*",
          start: paginationStart,
        })
        .then(
          (response) => {
            console.log(response)
            result = response.result.items;
            nextPage = response.result.queries.nextPage;
            request = response.result.queries.request;
            currentPage = (
              "" +
              (request[0].startIndex + request[0].count - 1)
            ).slice(0, -1);
          },
          (err) => {
            console.error("Execute error", err);
          }
        )
        .then(async () => {
          await render();
          resultItems.forEach((item) => {
            item.addEventListener("click", () => {
              previewInfos.forEach((infoItem) => {
                if (+item.id === +infoItem.id) {
                  previewRender(
                    infoItem.embedurl,
                    infoItem.author,
                    infoItem.title,
                    infoItem.views,
                    infoItem.link
                  );
                }
              });
            });
          });
        });
    };

    const buttonsCheck = () => {
      if (currentPage === "1") {
        arrowPrev.classList.add("hide");
        pageElement.classList.add("hide");
        arrowNext.classList.add("single");
      } else if (nextPage[0].count < 10) {
        arrowPrev.classList.add("single");
        pageElement.classList.add("hide");
        arrowNext.classList.add("hide");
      } else {
        arrowPrev.classList.remove("single", "hide");
        pageElement.classList.remove("hide");
        arrowNext.classList.remove("single", "hide");
      }
    };

    const render = () => {
      let renderElem = document.getElementById("results");
      renderElem.innerHTML = "";
      result.forEach((item, i) => {
        const elem = document.createElement("div");
        const title = item.title;
        const thumbnail = !!item.pagemap.videoobject
          ? item.pagemap.videoobject[0].thumbnailurl
          : null;
        const interactioncount = !!item.pagemap.videoobject
          ? item.pagemap.videoobject[0].interactioncount
          : null;
        const author = !!item.pagemap.person
          ? item.pagemap.person[0].name
          : "anonim";
        elem.id = i;
        const embedurl = !!item.pagemap.videoobject
          ? item.pagemap.videoobject[0].embedurl
          : !!item.pagemap.metatags
          ? item.pagemap.metatags[0]["og:video:url"]
          : null;
        previewInfos.push({
          id: i,
          embedurl: embedurl,
          link: item.link,
          author: author,
          title: title,
          views: shortenNumRu(interactioncount),
        });
        elem.innerHTML = `<div class="result__wrapper">
        <div class="result__preview"> <img src=${
          !!thumbnail ? thumbnail : "icons/Squircle.png"
        }> </div>
			<div class="result__info">
				<div class="result__title">${
          title.length >= 47 ? title.slice(0, 40) + "..." : title
        }</div>
				<div class="result__author">${author}</div>
				<div class="result__additional">
					<div class="result__platform"> <img src="icons/YouTube.svg" alt="youtube"> <div>Youtube.com</div> </div>
					<div class="result__views"> ${shortenNumRu(interactioncount)} views</div>
				</div>
			</div>
		</div>`;
        renderElem.appendChild(elem);
        resultItems.push(elem);
      });
    };

    const previewRender = (embedurl, author, title, views, link) => {
      document.querySelector("body").classList.add("scroll-hidden");
      preview.innerHTML = `
		  		<div class="preview__wrapper">
			<iframe width="100%" height="200px" src="${
        !embedurl.includes('undefined') ? embedurl : link
      }" title="YouTube video player"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen>
			</iframe>
			<div class="preview__info">
				<div class="preview__title">
					${title}
				</div>
				<div class="preview__additional">
					<div class="preview__additional-author">
						${author}
					</div>
					<div class="preview__additional-circle">
						<svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="2" cy="2" r="2" fill="#5D6067" />
						</svg>
					</div>
					<div class="preview__additional-views">
						${views} views
					</div>
				</div>
			</div>
			<div class="preview__buttons">
				<a target='_blank' href="${link}"><button class="preview__buttons-visit">Visit</button></a>
				<button class="preview__buttons-close">Close</button>
			</div>
		</div>`;
      document
        .querySelector(".preview__buttons-close")
        .addEventListener("click", () => {
          preview.innerHTML = "";
          document.querySelector("body").classList.remove("scroll-hidden");
        });
    };

    const shortenNumRu = (num) => {
      let bubu = {
        0: "",
        1: "k",
        2: "m",
        3: "b",
      };
      const thousands = Math.floor((("" + num).length - 1) / 3);
      const coef = 1000 ** thousands;
      return (num / coef).toFixed(1) + bubu[thousands];
    };

    gapi.load("client");
  },
  false
);
