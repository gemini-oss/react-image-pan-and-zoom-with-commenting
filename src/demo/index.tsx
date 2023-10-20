import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App";
import { CommentDotProps } from "../components/dot-container";
import useMediaQuery from "./useMediaQuery";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const Demo = () => {
  const matches = useMediaQuery();
  const [isCommentSubmitLoading, setIsCommentSubmitLoading] =
    React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [comments, setComments] = React.useState<CommentDotProps[]>([]);

  const handleCommentSubmit = (comment: CommentDotProps) => {
    setIsCommentSubmitLoading(true);

    setTimeout(() => {
      setComments([...comments, { ...comment }]);
      setIsCommentSubmitLoading(false);
    }, 3000);
  };

  React.useEffect(() => {
    setTimeout(() => {
      setComments([
        {
          x: 0.6016064257028112,
          y: 0.6058201058201058,
          comment:
            "Lorem ipsum dolor sit amet. Et quod alias qui sequi labore est nostrum debitis sed officiis laborum qui ipsam consequuntur in rerum unde et recusandae quibusdam. Cum iste repudiandae sit sint placeat sed quia velit et quidem doloribus qui doloremque unde est asperiores similique.",
        },
        {
          x: 0.7653844927601894,
          y: 0.4520125762495482,
          comment:
            "Ut ipsum numquam qui expedita dolorem cum quaerat consequatur ut natus laudantium aut aspernatur laboriosam et asperiores assumenda. Ea voluptatem neque non quia laborum ut consequatur voluptatum in voluptas debitis et quisquam quidem. Ut ipsum numquam qui expedita dolorem cum quaerat consequatur ut natus laudantium aut aspernatur laboriosam et asperiores assumenda. Ea voluptatem neque non quia laborum ut consequatur voluptatum in voluptas debitis et quisquam quidem.",
        },
        {
          x: 0.45380107538609804,
          y: 0.6221498059102408,
          comment:
            "Rem aliquam galisum sed ducimus velit aut natus magni vel illum tempora est voluptatem vero et quam culpa eos sequi nostrum. Sed aliquam nihil ut fugit amet aut rerum dolorem et tempora voluptas et vitae repellendus et itaque dolor.",
        },
      ]);
      setIsLoading(false);
    }, 2000);
  }, []);

  const mainSrc =
    matches.xs === null
      ? undefined
      : matches.xs
      ? "https://res.cloudinary.com/nifty-gateway/image/upload/v1697051340/SampleJPGImage_SmallerSrc.jpg"
      : "https://res.cloudinary.com/nifty-gateway/image/upload/v1697051356/SampleJPGImage_MainSrc.jpg";
  const previewBoxSrc =
    "https://res.cloudinary.com/nifty-gateway/image/upload/v1697051319/SampleJPGImage_PreviewBox.jpg";
  const smallerSrc =
    matches.xs === null
      ? undefined
      : matches.xs
      ? undefined
      : "https://res.cloudinary.com/nifty-gateway/image/upload/v1697051340/SampleJPGImage_SmallerSrc.jpg";

  return (
    <App
      src={mainSrc}
      previewBoxSrc={previewBoxSrc}
      smallerSrc={smallerSrc}
      comments={comments}
      isLoading={isLoading}
      isCommentSubmitLoading={isCommentSubmitLoading}
      onCommentSubmit={handleCommentSubmit}
    />
  );
};

root.render(
  <React.StrictMode>
    <Demo />
  </React.StrictMode>
);
