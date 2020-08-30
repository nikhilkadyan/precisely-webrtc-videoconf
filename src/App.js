import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import VideoConference from "./components/VideoConference";

const App = () => {
    return (
        <Router>
            <Switch>
                <Route exec path="/:conId" component={VideoConference} />
            </Switch>
        </Router >
    );
};

export default App;