import React, {Component} from "react"
import {Element, Navigate} from "react-router-dom"

import {
  ACCESS_LEVEL_GUEST,
  ACCESS_LEVEL_STUDENT,
  ACCESS_LEVEL_TEACHER,
  ACCESS_LEVEL_ADMIN
} from "../config/global_constants"

const LoggedInRoute = ({element: Element, ...rest}) => (
    localStorage.getItem("accessLevel") > 0 ? <Element {...rest}/> : <Navigate to="/login" replace/>
)

export default LoggedInRoute