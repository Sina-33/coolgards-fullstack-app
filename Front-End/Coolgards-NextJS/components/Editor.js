import {useEffect, useRef} from "react";

export const Editor = (editorLoaded, ...rest) => {
    const editorRef = useRef();
    const QuilEditor = editorRef.current;

    useEffect(() => {
        editorRef.current = require("react-quill");
    }, []);

    return (
        <div>
            {editorLoaded ? (
                <QuilEditor
                    {...rest}
                />
            ) : (
                <div>Editor loading</div>
            )}
        </div>
    );
}
