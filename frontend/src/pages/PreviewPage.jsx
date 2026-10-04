
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Eye,
  Heart,
} from "lucide-react";

import {
  getCommunityProject,
  apiError,
  likeCommunityProject,
} from "../utils/api";

import { useAuth } from "../context/AuthContext";

const PreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);

  // Load published project
  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const data = await getCommunityProject(id);

        if (!cancelled) {
          setProject(data.project);
        }
      } catch (err) {
        if (!cancelled) {
          setError(apiError(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadProject();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Like / Unlike
  async function handleLike() {
    // User is not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // No project / already processing / own project
    if (!project || liking || project.isOwn) {
      return;
    }

    setLiking(true);

    try {
      const data = await likeCommunityProject(project.id);

      setProject((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          likes: data.likes,
          likedByMe: data.liked,
        };
      });
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLiking(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Error
  if (error || !project) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white px-4">
        <h2 className="text-xl font-semibold mb-2">
          Preview unavailable
        </h2>

        <p className="text-gray-500 mb-6 text-center">
          {error || "Project not found"}
        </p>

        <Link
          to="/community"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-white overflow-hidden">

      {/* Back to Community */}
      <Link
        to="/community"
        className="
          fixed
          top-4
          left-4
          z-50
          inline-flex
          items-center
          gap-2
          px-3
          py-2
          rounded-lg
          bg-black/80
          text-white
          text-sm
          backdrop-blur-sm
          hover:bg-black
          transition
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Community
      </Link>

      {/* Views + Likes */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">

        {/* Views */}
        <div
          className="
            flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-lg
            bg-black/80
            text-white
            text-sm
            backdrop-blur-sm
          "
          title="Views"
        >
          <Eye className="w-4 h-4" />

          <span>
            {project.views ?? 0}
          </span>
        </div>

        {/* Likes */}
        <button
          type="button"
          onClick={handleLike}
          disabled={liking || project.isOwn}
          title={
            project.isOwn
              ? "You can't like your own project"
              : !user
              ? "Login to like"
              : project.likedByMe
              ? "Unlike"
              : "Like"
          }
          className={`
            flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-lg
            text-sm
            backdrop-blur-sm
            transition
            ${
              project.likedByMe
                ? "bg-red-500 text-white"
                : "bg-black/80 text-white hover:bg-black"
            }
            ${
              project.isOwn
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer"
            }
            ${
              liking
                ? "opacity-70 cursor-wait"
                : ""
            }
          `}
        >
          <Heart
            className={`
              w-4 h-4
              ${
                project.likedByMe
                  ? "fill-current"
                  : ""
              }
            `}
          />

          <span>
            {project.likes ?? 0}
          </span>
        </button>
      </div>

      {/* Full Screen Website */}
      <iframe
        title={project.name || "Website Preview"}
        srcDoc={project.html || ""}
        className="
          absolute
          inset-0
          w-full
          h-full
          border-0
        "
        sandbox="
          allow-scripts
          allow-forms
          allow-modals
          allow-popups
          allow-popups-to-escape-sandbox
        "
      />
    </div>
  );
};

export default PreviewPage;
