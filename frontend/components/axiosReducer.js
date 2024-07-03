export default function axiosReducer(state = { loading: false }, action) {
    switch (action.type) {
        case "SEARCH_LOADING":
            return { ...state, loading: action.payload };
        case "SEARCH_LOADING_FINISHED":
            return { ...state, loading: action.payload };
        default:
            return state;
    }
}


