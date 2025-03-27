interface RouteChangeEvent extends CustomEvent {
  detail: {
    path: string;
  };
}

declare global {
  interface WindowEventMap {
    routechange: RouteChangeEvent;
  }
}

export {}; 