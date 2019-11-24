import ReactDOM from "react-dom"
import React, { ReactElement, FunctionComponent } from "react"

export type AppParams = {
    title: string
    subtitle: string
    pageNumber: number
}

export function ssrApp(data: AppParams): ReactElement {
    return <div>
        <h1>{data.title}</h1>
        <h2>{data.subtitle}</h2>
        <p>Page {data.pageNumber}</p>
        <form action='/change' method='get'>
            Title: <input type='text' name='title' defaultValue={data.title}></input><br></br>
            Subtitle: <input type='text' name='subtitle' defaultValue={data.subtitle}></input><br></br>
            Page Number: <input type='number' name='pageNumber' defaultValue={data.pageNumber}></input><br></br>
            <button type='submit'>change</button>
        </form>
    </div>
}

export function render(data: AppParams): void {
    ReactDOM.hydrate(
        ssrApp(data),
        document.getElementById('root')
    )
}