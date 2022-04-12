// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Route, Router, Set } from "@redwoodjs/router";
import BasicLayout from "./layouts/BasicLayout/BasicLayout";

const Routes = () => {
  return (
    <div>
      <Router>
        <Set wrap={BasicLayout}>
          <Route path="/login" page={LoginPage} name="login" />
          <Route path="/signup" page={SignupPage} name="signup" />
          <Route path="/" page={HomePage} name="home" />
        </Set>
        {/* <Private unauthenticated="login"> */}
        <Route path="/dashboard" page={DashboardPage} name="dashboard" />
        {/* </Private> */}
        <Route notfound page={NotFoundPage} />
      </Router>
    </div>
  );
};

export default Routes;
