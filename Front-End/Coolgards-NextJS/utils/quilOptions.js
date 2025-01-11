const toolbarOptions = [
    ['blockquote', 'code-block'],
    [{'direction': 'rtl'}],                         // text direction
    [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
    [{'header': [1, 2, 3, 4, 5, 6, false]}],
    [{'color': []}, {'background': []}],          // dropdown with defaults from theme
    [{'font': []}],
    [{'align': []}],
    [{'header': [1, 2, false]}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean'],
]

export const modules = {
    toolbar: toolbarOptions,
    clipboard: {
        matchVisual: false,
    }
}