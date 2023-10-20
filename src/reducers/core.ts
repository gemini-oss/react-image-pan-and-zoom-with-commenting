export enum ActionType {
  TOGGLE_DRAWER = "TOGGLE_DRAWER",
  TOGGLE_PAN_AND_ZOOM = "TOGGLE_PAN_AND_ZOOM",
  TOGGLE_COMMENT_DISPLAY = "TOGGLE_COMMENT_DISPLAY",
  TOGGLE_COMMENT_CONFIRMATION = "TOGGLE_COMMENT_CONFIRMATION",
  COMMENT_DIALOG_CHANGE = "COMMENT_DIALOG_CHANGE",
  SET_ACTIVE_COMMENT = "SET_ACTIVE_COMMENT",
}

type Action =
  | { type: ActionType.TOGGLE_DRAWER; payload: boolean }
  | { type: ActionType.TOGGLE_PAN_AND_ZOOM; payload: boolean }
  | { type: ActionType.TOGGLE_COMMENT_DISPLAY; payload: boolean }
  | { type: ActionType.TOGGLE_COMMENT_CONFIRMATION; payload: boolean }
  | { type: ActionType.COMMENT_DIALOG_CHANGE; payload: string }
  | {
      type: ActionType.SET_ACTIVE_COMMENT;
      payload: {
        value: string | null;
        index: number;
      };
    };

type InitialStateProps = {
  drawerOpen: boolean;
  panAndZoomEnabled: boolean;
  displayComments: boolean;
  commentConfirmed: boolean;
  commentDialogValue: string;
  activeComment: {
    value: string | null;
    index: number;
  };
};

export const getInitialState = (state?: Partial<InitialStateProps>) => {
  return {
    drawerOpen: false,
    panAndZoomEnabled: false,
    displayComments: false,
    commentConfirmed: false,
    commentDialogValue: "",
    activeComment: {
      value: null,
      index: -1,
    },
    ...(state ?? {}),
  };
};

function coreReducer(state = getInitialState(), action: Action) {
  if (action.type === ActionType.TOGGLE_DRAWER) {
    return {
      ...state,
      drawerOpen: action.payload,
    };
  }

  if (action.type === ActionType.TOGGLE_PAN_AND_ZOOM) {
    return {
      ...state,
      panAndZoomEnabled: action.payload,
    };
  }

  if (action.type === ActionType.TOGGLE_COMMENT_DISPLAY) {
    return {
      ...state,
      displayComments: action.payload,
    };
  }

  if (action.type === ActionType.TOGGLE_COMMENT_CONFIRMATION) {
    return {
      ...state,
      commentConfirmed: action.payload,
    };
  }

  if (action.type === ActionType.COMMENT_DIALOG_CHANGE) {
    return {
      ...state,
      commentDialogValue: action.payload,
    };
  }

  if (action.type === ActionType.SET_ACTIVE_COMMENT) {
    return {
      ...state,
      activeComment: action.payload,
    };
  }

  return state;
}

export default coreReducer;
