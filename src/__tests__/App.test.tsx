import { screen, waitFor, cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import App from "../App";

const mainImgSrc =
  "https://res.cloudinary.com/nifty-gateway/image/upload/v1697051340/SampleJPGImage_SmallerSrc.jpg";
const previewSrc =
  "https://res.cloudinary.com/nifty-gateway/image/upload/v1697051319/SampleJPGImage_PreviewBox.jpg";

afterEach(() => cleanup());

test("should display my custom loader while main image is loading", () => {
  render(
    <App
      src={mainImgSrc}
      previewBoxSrc={previewSrc}
      imgLoader={<span data-testid="myImgLoader">I am loading...</span>}
    />
  );

  const myImgLoader = screen.getByTestId("myImgLoader");

  expect(myImgLoader).toBeInTheDocument();
});

test("should display my custom error if main image encounters an error during loading", async () => {
  render(
    <App
      src={mainImgSrc}
      previewBoxSrc={previewSrc}
      errorDisplay={
        <span data-testid="myErrorDisplay">Ran into an error...</span>
      }
    />
  );

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("error"));
  });

  await waitFor(() => {
    const myErrorDisplay = screen.getByTestId("myErrorDisplay");
    expect(myErrorDisplay).toBeInTheDocument();
  });
});

test("image load callback should fire when the main image has loaded", async () => {
  const imgLoadCallback = jest.fn();

  render(
    <App
      src={mainImgSrc}
      previewBoxSrc={previewSrc}
      onImageLoad={imgLoadCallback}
    />
  );

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("load"));
  });

  await waitFor(() => {
    expect(imgLoadCallback).toHaveBeenCalled();
  });
});

test("clicking the main image after load should take you to pan and zoom experience", async () => {
  render(<App src={mainImgSrc} previewBoxSrc={previewSrc} />);

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("load"));
  });

  await waitFor(() => {
    const imagePanAndZoomEnableButton = screen.getByTestId(
      "imagePanAndZoomEnableButton"
    );
    expect(imagePanAndZoomEnableButton).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId("imagePanAndZoomEnableButton"));

  const imagePanAndZoom = screen.getByTestId("imagePanAndZoom");
  
  await waitFor(() => {
    expect(imagePanAndZoom).toHaveClass("is-fullscreen");
  });

  // close pan and zoom
  userEvent.click(screen.getByTestId('imagePanAndZoomCloseButton'))

  await waitFor(() => {
    expect(imagePanAndZoom).not.toHaveClass("is-fullscreen");
  });
});

test("comment drawer button should not be visible when there are no comments", async () => {
  render(<App src={mainImgSrc} previewBoxSrc={previewSrc} />);

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("load"));
  });

  await waitFor(() => {
    const imagePanAndZoomEnableButton = screen.getByTestId(
      "imagePanAndZoomEnableButton"
    );
    expect(imagePanAndZoomEnableButton).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId("imagePanAndZoomEnableButton"));

  await waitFor(() => {
    const imagePanAndZoom = screen.getByTestId("imagePanAndZoom");
    expect(imagePanAndZoom).toHaveClass("is-fullscreen");
  });

  const commentDrawerButton = screen.queryByTestId("commentDrawerButton");
  expect(commentDrawerButton).toBeNull();
});

test("comment dialog should display if a user clicks on the image", async () => {
  render(<App src={mainImgSrc} previewBoxSrc={previewSrc} />);

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("load"));
  });

  await waitFor(() => {
    const imagePanAndZoomEnableButton = screen.getByTestId(
      "imagePanAndZoomEnableButton"
    );
    expect(imagePanAndZoomEnableButton).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId("imagePanAndZoomEnableButton"));
  userEvent.click(screen.getByTestId("imagePanAndZoomWrapper"));

  await waitFor(() => {
    const commentDialog = screen.getByTestId("commentDialog");
    expect(commentDialog).toBeInTheDocument();
  });
});

test("onCommentSubmit callback should fire when a user submits a new comment", async () => {
  const submitCommentCallback = jest.fn();

  render(
    <App
      src={mainImgSrc}
      previewBoxSrc={previewSrc}
      onCommentSubmit={submitCommentCallback}
    />
  );

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("load"));
  });

  await waitFor(() => {
    const imagePanAndZoomEnableButton = screen.getByTestId(
      "imagePanAndZoomEnableButton"
    );
    expect(imagePanAndZoomEnableButton).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId("imagePanAndZoomEnableButton"));
  userEvent.click(screen.getByTestId("imagePanAndZoomWrapper"));

  const commentDialogSubmitButton = screen.getByTestId(
    "commentDialogSubmitButton"
  );
  const commentDialogTextarea = screen.getByTestId("commentDialogTextarea");

  await waitFor(() => {
    expect(commentDialogSubmitButton).toBeDisabled();
  });

  userEvent.type(commentDialogTextarea, "testing 123");

  await waitFor(() => {
    expect(commentDialogTextarea).toHaveValue("testing 123");
  });

  await waitFor(() => {
    expect(commentDialogSubmitButton).not.toBeDisabled();
  });

  userEvent.click(commentDialogSubmitButton);
  const commentDialogCheckbox = screen.getByTestId("commentDialogCheckbox");

  // User should now be on confirmation stage which displays a checkbox
  await waitFor(() => {
    expect(commentDialogCheckbox).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(commentDialogSubmitButton).toBeDisabled();
  });

  userEvent.click(commentDialogCheckbox);
  userEvent.click(commentDialogSubmitButton);

  await waitFor(() => {
    expect(submitCommentCallback).toHaveBeenCalled();
  });
});

test("user should be able to open and close comment drawer if comments are present", async () => {
  render(
    <App
      src={mainImgSrc}
      previewBoxSrc={previewSrc}
      comments={[
        {
          x: 0.6016064257028112,
          y: 0.6058201058201058,
          comment:
            "Lorem ipsum dolor sit amet. Et quod alias qui sequi labore est nostrum debitis sed officiis laborum qui ipsam consequuntur in rerum unde et recusandae quibusdam. Cum iste repudiandae sit sint placeat sed quia velit et quidem doloribus qui doloremque unde est asperiores similique.",
        },
      ]}
    />
  );

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("load"));
  });

  await waitFor(() => {
    const imagePanAndZoomEnableButton = screen.getByTestId(
      "imagePanAndZoomEnableButton"
    );
    expect(imagePanAndZoomEnableButton).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId("imagePanAndZoomEnableButton"));

  const commentDrawerButton = screen.getByTestId("commentDrawerButton");
  const commentDrawer = screen.getByTestId("commentDrawer");

  await waitFor(() => {
    expect(commentDrawerButton).toBeInTheDocument();
  });

  userEvent.click(commentDrawerButton);

  await waitFor(() => {
    expect(commentDrawer).not.toHaveClass("closed");
  });

  await waitFor(() => {
    const firstCommentInDrawer = screen.getByTestId("commentDrawerListItem_0");
    expect(firstCommentInDrawer).toHaveTextContent(
      "Comment # 1Lorem ipsum dolor sit amet. Et quod alias qui sequi labore est nostrum debitis sed officiis laborum qui ipsam consequuntur in rerum unde et recusandae quibusdam. Cum iste repudiandae sit sint placeat sed quia velit et quidem doloribus qui doloremque unde est asperiores similique."
    );
  });

  userEvent.click(screen.getByTestId("commentDrawerCloseButton"));

  await waitFor(() => {
    expect(commentDrawer).toHaveClass("closed");
  });
});

test("comment dot should appear for each valid comment", async () => {
  render(
    <App
      src={mainImgSrc}
      previewBoxSrc={previewSrc}
      comments={[
        {
          x: 0.6016064257028112,
          y: 0.6058201058201058,
          comment:
            "Lorem ipsum dolor sit amet. Et quod alias qui sequi labore est nostrum debitis sed officiis laborum qui ipsam consequuntur in rerum unde et recusandae quibusdam. Cum iste repudiandae sit sint placeat sed quia velit et quidem doloribus qui doloremque unde est asperiores similique.",
        },
      ]}
    />
  );

  await waitFor(() => {
    const mainImgElement = screen.getByTestId("mainImgElement");
    mainImgElement.dispatchEvent(new Event("load"));
  });

  await waitFor(() => {
    const imagePanAndZoomEnableButton = screen.getByTestId(
      "imagePanAndZoomEnableButton"
    );
    expect(imagePanAndZoomEnableButton).toBeInTheDocument();
  });

  userEvent.click(screen.getByTestId("imagePanAndZoomEnableButton"));

  const commentDisplaySwitch = screen.getByTestId("commentDisplaySwitch");

  await waitFor(() => {
    expect(screen.queryByTestId("commentDot_0")).toBeNull();
  });

  // toggle display of comments
  userEvent.click(commentDisplaySwitch);

  const commentDot = screen.getByTestId("commentDot_0");

  await waitFor(() => {
    expect(commentDot).toBeInTheDocument();
  });

  userEvent.click(commentDot);

  await waitFor(() => {
    expect(screen.getByTestId("activeComment")).toHaveTextContent(
      "Comment #1Lorem ipsum dolor sit amet. Et quod alias qui sequi labore est nostrum debitis sed officiis laborum qui ipsam consequuntur in rerum unde et recusandae quibusdam. Cum iste repudiandae sit sint placeat sed quia velit et quidem doloribus qui doloremque unde est asperiores similique."
    );
  });

  // close active comment
  userEvent.click(screen.getByTestId("activeCommentCloseButton"));

  await waitFor(() => {
    expect(screen.getByTestId("activeComment")).toHaveStyle('display: none;')
  });
});
