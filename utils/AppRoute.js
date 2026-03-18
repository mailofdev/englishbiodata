import React from 'react';
import { Route } from 'react-router-dom';

const AppRoute = ({ component: Component, layout: Layout, ...rest }) => {
  return (
    <Route
      {...rest}
      element={
        <Layout>
          <Component />
        </Layout>
      }
    />
  );
};

export default AppRoute;
