import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable'; // polyfilling everything else
import 'regenerator-runtime/runtime'; // polyfilling async await
import { async } from 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    // UPDATE RESULTS VIEW TO MARK SELECTED SEARCH RESULT
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    // LOADING RECIPE
    await model.loadRecipe(id);
    // RENDERING RECIPE
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // GET SEARCH QUERY
    const query = searchView.getQuery();
    if (!query) return;
    // LOAD SEARCH
    await model.loadSearchResults(query);
    // RENDER RESULTS
    resultsView.render(model.getSearchResultsPage());
    // RENDER PAGINATION BUTTONS
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // RENDER NEW RESULTS
  resultsView.render(model.getSearchResultsPage(goToPage));
  // RENDER NEW PAGINATION BUTTONS
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update recipe servings (in state)
  model.updateServings(newServings);
  // Update recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // ADD OR REMOVE BOOKMARK
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // UPDATE RECIPE VIEW
  recipeView.update(model.state.recipe);
  // RENDER BOOKMARKS
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //RENDER LOADING SPINNER
    addRecipeView.renderSpinner();
    //UPLOAD RECIPE DATA
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);
    // RENDER NEW RECIPE
    recipeView.render(model.state.recipe);
    //DISPLAY SUCCESS MESSAGE
    addRecipeView.renderMessage();
    //RENDER BOOKMARK VIEW
    bookmarksView.render(model.state.bookmarks);
    //CHANGE ID IN THE URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //CLOSE FORM WINDOW
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(`${err} 🧨`);
    addRecipeView.renderError(err.message);
  }
};

// Publisher subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
