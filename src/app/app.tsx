import React from "react";
import { Route, Switch } from "react-router-dom";
import { FormDataService } from "./features/form/services";
import { Form } from "app/features/form/components/Form";
import { Home } from "app/features/home/components/Home";

export default function App() {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/form"><Form dataModel={FormDataService} /></Route>
      </Switch>
    </div>
  );
}

