import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import VideoConference from "./components/VideoConference";

const App = () => {
  const randomID = Date.now().toPrecision();
    return (
        <Router>
            <Switch>
              <Redirect from="/" to={`/${randomID}`}  exact/>
                <Route exec path="/:conId" component={VideoConference} />
            </Switch>
        </Router >
    );
};

export default App;