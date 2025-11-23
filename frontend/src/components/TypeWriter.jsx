import React, {useRef, useEffect} from "react";
import Typed from "typed.js";

function TypeWriter({strings, typeSpeed = 50, backSpeed = 25, loop = true, showCursor = false, asHtml = false}) {
    const el = useRef(null);

    useEffect(() => {
        const typed = new Typed(el.current, {
            strings,
            typeSpeed,
            backSpeed,
            loop,
            showCursor,
            contentType: asHtml ? "html" : "null"
        });

        return () => {
            typed.destroy();
        };
    }, [strings, typeSpeed, backSpeed, loop, asHtml]);

    return <span ref={el}/>;
}

export default TypeWriter;
