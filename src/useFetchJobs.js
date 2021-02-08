import { useReducer, useEffect } from 'react'
import axios from 'axios'

const ACTIONS = {
    MAKE_REQUEST: 'make-request',
    GET_DATA: 'get-data',
    ERROR: 'error',
    UPDATE_HAS_NEXT_PAGE: 'update-has-next-page',
}

// const BASE_URL =
// 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json'

// const BASE_URL =
//     'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json'

// https://nl.hideproxy.me/go.php?u=bcGhZ6qwJbPtPTfACIOsupeqe%2FwRO1nf5lrNGvHdivcSDQ%3D%3D&b=5
const BASE_URL = '/positions.json'

function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.MAKE_REQUEST:
            return { loading: true, jobs: [] }

        case ACTIONS.GET_DATA:
            return { ...state, loading: false, jobs: action.payload.jobs }

        case ACTIONS.ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload.error,
                jobs: [],
            }

        case ACTIONS.UPDATE_HAS_NEXT_PAGE:
            return {
                ...state,
                hasNextPage: action.payload.has_next_page,
            }

        default:
            return state
    }
}

export default function useFetchJobs(params, page) {
    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true })

    // alert('useFetchJobs')

    useEffect(() => {
        const cancelToken1 = axios.CancelToken.source()
        dispatch({ type: ACTIONS.MAKE_REQUEST })

        axios
            .get(BASE_URL, {
                params: { markdown: true, page: page, ...params },
            })
            .then((res) => {
                dispatch({
                    type: ACTIONS.GET_DATA,
                    payload: { jobs: res.data },
                })
            })
            .catch((err) => {
                if (axios.isCancel(err)) return
                dispatch({
                    type: ACTIONS.ERROR,
                    payload: { error: err },
                })
            })

        const cancelToken2 = axios.CancelToken.source()
        axios
            .get(BASE_URL, {
                params: { markdown: true, page: page + 1, ...params },
            })
            .then((res) => {
                dispatch({
                    type: ACTIONS.UPDATE_HAS_NEXT_PAGE,
                    payload: {
                        hasNextPage: res.data.length !== 0,
                    },
                })
            })
            .catch((err) => {
                if (axios.isCancel(err)) return
                dispatch({
                    type: ACTIONS.ERROR,
                    payload: { error: err },
                })
            })

        return () => {
            cancelToken1.cancel()
            cancelToken2.cancel()
        }
    }, [params, page])

    // return {
    //     jobs: [1, 2, 3],
    //     loading: false,
    //     error: true,
    // }
    return state
}
