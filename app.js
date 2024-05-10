document.addEventListener("DOMContentLoaded", function () {
  const filterForm = document.querySelector(".filter");

  const counter = document.getElementById("result-counter");
  let apartmentsData = [];
  let currentFilters = {};
  let currentSortBy = "highest_price";

  const apartmentsContainer = document.querySelector(".apartments");
  const gridIcon = document.querySelector(".grid");
  const listIcon = document.querySelector(".list");

  gridIcon.addEventListener("click", () => {
    apartmentsContainer.classList.remove("list-view");
    gridIcon.classList.add("active");
    listIcon.classList.remove("active");
  });

  listIcon.addEventListener("click", () => {
    apartmentsContainer.classList.add("list-view");
    listIcon.classList.add("active");
    gridIcon.classList.remove("active");
  });

  // Pobierz przycisk i sekcję preferencji
  const toggleButton = document.getElementById("togglePreferences");
  const preferencesSection = document.getElementById("preferencesSection");

  // Dodaj nasłuchiwanie kliknięcia na przycisk
  toggleButton.addEventListener("click", function () {
    // Sprawdź aktualną widoczność sekcji preferencji
    const isVisible =
      window.getComputedStyle(preferencesSection).display !== "none";

    // Zmień widoczność sekcji preferencji
    if (isVisible) {
      toggleButton.classList.remove("active");
      preferencesSection.style.display = "none";
    } else {
      toggleButton.classList.add("active");
      preferencesSection.style.display = "flex"; // lub 'block', w zależności od preferencji stylowania
    }
  });

  function renderApartments(apartments) {
    apartmentsContainer.innerHTML = "";

    if (apartments.length === 0) {
      const noResultsMessage = document.createElement("div");
      noResultsMessage.classList.add("no-results");
      noResultsMessage.textContent = "No results ";
      apartmentsContainer.appendChild(noResultsMessage);
      return;
    }

    if (counter) {
      counter.textContent = `Found ${apartments.length} results`;
    }

    apartments.forEach((apartment) => {
      const singleApartment = document.createElement("div");
      singleApartment.classList.add("single-apart");
      singleApartment.style.backgroundImage = `url('${apartment.backgroundImage}')`; // Dodaj tło za pomocą obrazka
      singleApartment.innerHTML = `
        <div class="inner">
          <h3>${apartment.name}</h3>
          <p>Type: ${apartment.type}</p>
          <div class="price-square-row">
          <p>Price: ${apartment.price} zł</p>
          <p>Square: ${apartment.square} m2</p>
          </div>
          <p>Location: ${apartment.town}, ${apartment.country}</p>
        </div>
      `;
      apartmentsContainer.appendChild(singleApartment);

      setTimeout(() => {
        singleApartment.classList.add("show");
      }, 10);
    });
  }

  // Funkcja wstawiająca opcje filtru na podstawie danych z serwera
  function populateFilterOptions() {
    const propertyTypeSelect = document.getElementById("property-type");
    const minPriceInput = document.querySelector(".min-price");
    const maxPriceInput = document.querySelector(".max-price");
    const minSquareInput = document.querySelector(".min-square");
    const maxSquareInput = document.querySelector(".max-square");

    const locationDatalist = document.getElementById("locations"); // Dodaj pobieranie datalisty

    const propertyTypes = [
      ...new Set(apartmentsData.map((apartment) => apartment.type)),
    ];
    propertyTypes.forEach((type) => {
      const option = document.createElement("option");
      option.textContent = type;
      option.value = type;
      propertyTypeSelect.appendChild(option);
    });

    minPriceInput.addEventListener("change", filterApartments);
    maxPriceInput.addEventListener("change", filterApartments);

    minSquareInput.addEventListener("change", filterApartments);
    maxSquareInput.addEventListener("change", filterApartments);

    // Generowanie opcji dla datalisty
    apartmentsData.forEach((apartment) => {
      const option = document.createElement("option");
      option.textContent = `${apartment.town}`;
      option.value = `${apartment.town}`;
      locationDatalist.appendChild(option);
    });

    // Ustaw wartości filtrów na ich aktualne wartości
    propertyTypeSelect.value = currentFilters.propertyType || "All";
    minPriceInput.value = currentFilters.minPrice || "";
    maxPriceInput.value = currentFilters.maxPrice || "";
    minSquareInput.value = currentFilters.minSquare || "";
    maxSquareInput.value = currentFilters.maxSquare || "";
  }

  // Funkcja sortująca apartamenty
  function sortApartments(sortBy) {
    currentSortBy = sortBy; // Zapisz aktualny sposób sortowania
    if (sortBy === "lowest_price") {
      apartmentsData.sort((a, b) => parseInt(a.price) - parseInt(b.price));
    } else if (sortBy === "highest_price") {
      apartmentsData.sort((a, b) => parseInt(b.price) - parseInt(a.price));
    }
    filterApartments(); // Ponownie zastosuj filtry po sortowaniu
  }

  function filterApartments() {
    const query = document.getElementById("location").value.toLowerCase();
    const propertyType = document.querySelector(".property-type").value;
    const minPrice = parseInt(document.querySelector(".min-price").value) || 0;
    const maxPrice =
      parseInt(document.querySelector(".max-price").value) || Infinity;
    const minSquare =
      parseInt(document.querySelector(".min-square").value) || 0;
    const maxSquare =
      parseInt(document.querySelector(".max-square").value) || Infinity;

    const goodCommute = document.getElementById("good-commute").checked;
    const activeLifestyle = document.getElementById("active-lifestyle").checked;
    const childrenFriendly =
      document.getElementById("children-friendly").checked;
    const petFriendly = document.getElementById("pet-friendly").checked;
    const furnished = document.getElementById("furnished").checked;

    currentFilters = {
      location: query,
      propertyType,
      minPrice,
      maxPrice,
      minSquare,
      maxSquare,
      goodCommute,
      activeLifestyle,
      childrenFriendly,
      petFriendly,
      furnished,
    };

    const filteredApartments = apartmentsData.filter((apartment) => {
      const [inputCity, inputCountry] = query
        .split(",")
        .map((part) => part.trim());

      const cityMatches = apartment.town.toLowerCase().includes(inputCity);
      const countryMatches = apartment.country
        .toLowerCase()
        .includes(inputCountry);

      return (
        (cityMatches || countryMatches) &&
        (propertyType === "All" || apartment.type === propertyType) &&
        checkPriceInRange(apartment.price, minPrice, maxPrice) &&
        checkSquareInRange(apartment.square, minSquare, maxSquare) &&
        (goodCommute ? apartment.preferences.includes("good commute") : true) &&
        (activeLifestyle
          ? apartment.preferences.includes("active lifestyle")
          : true) &&
        (childrenFriendly
          ? apartment.preferences.includes("children friendly")
          : true) &&
        (petFriendly ? apartment.preferences.includes("pet friendly") : true) &&
        (furnished ? apartment.preferences.includes("furnished") : true)
      );
    });

    renderApartments(filteredApartments);
  }

  // Funkcja sprawdzająca, czy cena mieszczą się w podanym przedziale
  function checkPriceInRange(price, minRange, maxRange) {
    return parseInt(price) >= minRange && parseInt(price) <= maxRange;
  }
  function checkSquareInRange(square, minRange, maxRange) {
    return parseInt(square) >= minRange && parseInt(square) <= maxRange;
  }
  // Obsługa zdarzeń dla formularza filtru
  filterForm.addEventListener("change", filterApartments);

  // Obsługa zdarzenia dla sortowania
  const sortSelect = document.querySelector(".sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", function (event) {
      const sortBy = event.target.value;
      sortApartments(sortBy);
    });
  }
  // Obsługa zdarzeń dla zmiany stanu checkboxów preferencji
  const preferenceCheckboxes = document.querySelectorAll(
    '.pref-checkbox input[type="checkbox"]'
  );
  preferenceCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      filterApartments(); // Odśwież listę apartamentów po zmianie preferencji
    });
  });

  // Pobierz listę apartamentów z serwera
  fetch("http://localhost:8005/apartments")
    .then((response) => response.json())
    .then((data) => {
      if (data && Array.isArray(data)) {
        apartmentsData = data;
        sortApartments(currentSortBy); // Sortuj apartamenty według aktualnego sposobu sortowania
        populateFilterOptions();
      } else {
        console.error("Dane lub lista apartamentów są niezdefiniowane.");
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
});
