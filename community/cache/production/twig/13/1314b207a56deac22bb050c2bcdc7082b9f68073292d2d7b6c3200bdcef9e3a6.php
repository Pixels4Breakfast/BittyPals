<?php

/* forumlist_body.html */
class __TwigTemplate_7fda603750462e709a11e2d4fcc382b0fd881abb2a8c8a159afb310a77fef924 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        // line 1
        echo "
";
        // line 2
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable($this->getAttribute((isset($context["loops"]) ? $context["loops"] : null), "forumrow", array()));
        $context['_iterated'] = false;
        foreach ($context['_seq'] as $context["_key"] => $context["forumrow"]) {
            // line 3
            echo "\t";
            if ((($this->getAttribute($context["forumrow"], "S_IS_CAT", array()) &&  !$this->getAttribute($context["forumrow"], "S_FIRST_ROW", array())) || $this->getAttribute($context["forumrow"], "S_NO_CAT", array()))) {
                // line 4
                echo "\t\t\t</ul>

\t\t\t</div>
\t\t</div>
\t";
            }
            // line 9
            echo "
\t";
            // line 10
            // line 11
            echo "\t";
            if ((($this->getAttribute($context["forumrow"], "S_IS_CAT", array()) || $this->getAttribute($context["forumrow"], "S_FIRST_ROW", array())) || $this->getAttribute($context["forumrow"], "S_NO_CAT", array()))) {
                // line 12
                echo "\t\t<div class=\"forabg\">
\t\t\t<div class=\"inner\">
\t\t\t<ul class=\"topiclist\">
\t\t\t\t<li class=\"header\">
\t\t\t\t\t";
                // line 16
                // line 17
                echo "\t\t\t\t\t<dl class=\"row-item\">
\t\t\t\t\t\t<dt><div class=\"list-inner\">";
                // line 18
                if ($this->getAttribute($context["forumrow"], "S_IS_CAT", array())) {
                    echo "<a href=\"";
                    echo $this->getAttribute($context["forumrow"], "U_VIEWFORUM", array());
                    echo "\">";
                    echo $this->getAttribute($context["forumrow"], "FORUM_NAME", array());
                    echo "</a>";
                } else {
                    echo $this->env->getExtension('phpbb')->lang("FORUM");
                }
                echo "</div></dt>
\t\t\t\t\t\t<dd class=\"topics\">";
                // line 19
                echo $this->env->getExtension('phpbb')->lang("TOPICS");
                echo "</dd>
\t\t\t\t\t\t<dd class=\"posts\">";
                // line 20
                echo $this->env->getExtension('phpbb')->lang("POSTS");
                echo "</dd>
\t\t\t\t\t\t<dd class=\"lastpost\"><span>";
                // line 21
                echo $this->env->getExtension('phpbb')->lang("LAST_POST");
                echo "</span></dd>
\t\t\t\t\t</dl>
\t\t\t\t\t";
                // line 23
                // line 24
                echo "\t\t\t\t</li>
\t\t\t</ul>
\t\t\t<ul class=\"topiclist forums\">
\t";
            }
            // line 28
            echo "\t";
            // line 29
            echo "
\t";
            // line 30
            if ( !$this->getAttribute($context["forumrow"], "S_IS_CAT", array())) {
                // line 31
                echo "\t\t";
                // line 32
                echo "\t\t<li class=\"row\">
\t\t\t";
                // line 33
                // line 34
                echo "\t\t\t<dl class=\"row-item ";
                echo $this->getAttribute($context["forumrow"], "FORUM_IMG_STYLE", array());
                echo "\">
\t\t\t\t<dt title=\"";
                // line 35
                echo $this->getAttribute($context["forumrow"], "FORUM_FOLDER_IMG_ALT", array());
                echo "\">
\t\t\t\t\t";
                // line 36
                if ($this->getAttribute($context["forumrow"], "S_UNREAD_FORUM", array())) {
                    echo "<a href=\"";
                    echo $this->getAttribute($context["forumrow"], "U_VIEWFORUM", array());
                    echo "\" class=\"row-item-link\"></a>";
                }
                // line 37
                echo "\t\t\t\t\t<div class=\"list-inner\">
\t\t\t\t\t\t";
                // line 38
                if (((isset($context["S_ENABLE_FEEDS"]) ? $context["S_ENABLE_FEEDS"] : null) && $this->getAttribute($context["forumrow"], "S_FEED_ENABLED", array()))) {
                    // line 39
                    echo "\t\t\t\t\t\t\t<!--
\t\t\t\t\t\t\t\t<a class=\"feed-icon-forum\" title=\"";
                    // line 40
                    echo $this->env->getExtension('phpbb')->lang("FEED");
                    echo " - ";
                    echo $this->getAttribute($context["forumrow"], "FORUM_NAME", array());
                    echo "\" href=\"";
                    echo (isset($context["U_FEED"]) ? $context["U_FEED"] : null);
                    echo "?f=";
                    echo $this->getAttribute($context["forumrow"], "FORUM_ID", array());
                    echo "\">
\t\t\t\t\t\t\t\t\t<i class=\"icon fa-rss-square fa-fw icon-orange\" aria-hidden=\"true\"></i><span class=\"sr-only\">";
                    // line 41
                    echo $this->env->getExtension('phpbb')->lang("FEED");
                    echo " - ";
                    echo $this->getAttribute($context["forumrow"], "FORUM_NAME", array());
                    echo "</span>
\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t-->
\t\t\t\t\t\t";
                }
                // line 45
                echo "\t\t\t\t\t\t";
                if ($this->getAttribute($context["forumrow"], "FORUM_IMAGE", array())) {
                    echo "<span class=\"forum-image\">";
                    echo $this->getAttribute($context["forumrow"], "FORUM_IMAGE", array());
                    echo "</span>";
                }
                // line 46
                echo "\t\t\t\t\t\t<a href=\"";
                echo $this->getAttribute($context["forumrow"], "U_VIEWFORUM", array());
                echo "\" class=\"forumtitle\">";
                echo $this->getAttribute($context["forumrow"], "FORUM_NAME", array());
                echo "</a>
\t\t\t\t\t\t";
                // line 47
                if ($this->getAttribute($context["forumrow"], "FORUM_DESC", array())) {
                    echo "<br />";
                    echo $this->getAttribute($context["forumrow"], "FORUM_DESC", array());
                }
                // line 48
                echo "\t\t\t\t\t\t";
                if ($this->getAttribute($context["forumrow"], "MODERATORS", array())) {
                    // line 49
                    echo "\t\t\t\t\t\t\t<br /><strong>";
                    echo $this->getAttribute($context["forumrow"], "L_MODERATOR_STR", array());
                    echo $this->env->getExtension('phpbb')->lang("COLON");
                    echo "</strong> ";
                    echo $this->getAttribute($context["forumrow"], "MODERATORS", array());
                    echo "
\t\t\t\t\t\t";
                }
                // line 51
                echo "\t\t\t\t\t\t";
                if ((twig_length_filter($this->env, $this->getAttribute($context["forumrow"], "subforum", array())) && $this->getAttribute($context["forumrow"], "S_LIST_SUBFORUMS", array()))) {
                    // line 52
                    echo "\t\t\t\t\t\t\t";
                    // line 53
                    echo "\t\t\t\t\t\t\t<br /><strong>";
                    echo $this->getAttribute($context["forumrow"], "L_SUBFORUM_STR", array());
                    echo $this->env->getExtension('phpbb')->lang("COLON");
                    echo "</strong>
\t\t\t\t\t\t\t";
                    // line 54
                    $context['_parent'] = $context;
                    $context['_seq'] = twig_ensure_traversable($this->getAttribute($context["forumrow"], "subforum", array()));
                    foreach ($context['_seq'] as $context["_key"] => $context["subforum"]) {
                        // line 55
                        echo "\t\t\t\t\t\t\t\t<a href=\"";
                        echo $this->getAttribute($context["subforum"], "U_SUBFORUM", array());
                        echo "\" class=\"subforum";
                        if ($this->getAttribute($context["subforum"], "S_UNREAD", array())) {
                            echo " unread";
                        } else {
                            echo " read";
                        }
                        echo "\" title=\"";
                        if ($this->getAttribute($context["subforum"], "S_UNREAD", array())) {
                            echo $this->env->getExtension('phpbb')->lang("UNREAD_POSTS");
                        } else {
                            echo $this->env->getExtension('phpbb')->lang("NO_UNREAD_POSTS");
                        }
                        echo "\">
\t\t\t\t\t\t\t\t\t<i class=\"icon ";
                        // line 56
                        if ($this->getAttribute($context["subforum"], "IS_LINK", array())) {
                            echo "fa-external-link";
                        } else {
                            echo "fa-file-o";
                        }
                        echo " fa-fw ";
                        if ($this->getAttribute($context["subforum"], "S_UNREAD", array())) {
                            echo " icon-red";
                        } else {
                            echo " icon-blue";
                        }
                        echo " icon-md\" aria-hidden=\"true\"></i>";
                        echo $this->getAttribute($context["subforum"], "SUBFORUM_NAME", array());
                        echo "
\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t";
                        // line 58
                        if ( !$this->getAttribute($context["subforum"], "S_LAST_ROW", array())) {
                            echo $this->env->getExtension('phpbb')->lang("COMMA_SEPARATOR");
                        }
                        // line 59
                        echo "\t\t\t\t\t\t\t";
                    }
                    $_parent = $context['_parent'];
                    unset($context['_seq'], $context['_iterated'], $context['_key'], $context['subforum'], $context['_parent'], $context['loop']);
                    $context = array_intersect_key($context, $_parent) + $_parent;
                    // line 60
                    echo "\t\t\t\t\t\t\t";
                    // line 61
                    echo "\t\t\t\t\t\t";
                }
                // line 62
                echo "
\t\t\t\t\t\t";
                // line 63
                if ( !(isset($context["S_IS_BOT"]) ? $context["S_IS_BOT"] : null)) {
                    // line 64
                    echo "\t\t\t\t\t\t<div class=\"responsive-show\" style=\"display: none;\">
\t\t\t\t\t\t\t";
                    // line 65
                    if ($this->getAttribute($context["forumrow"], "CLICKS", array())) {
                        // line 66
                        echo "\t\t\t\t\t\t\t\t";
                        echo $this->env->getExtension('phpbb')->lang("REDIRECTS");
                        echo $this->env->getExtension('phpbb')->lang("COLON");
                        echo " <strong>";
                        echo $this->getAttribute($context["forumrow"], "CLICKS", array());
                        echo "</strong>
\t\t\t\t\t\t\t";
                    } elseif (( !$this->getAttribute(                    // line 67
$context["forumrow"], "S_IS_LINK", array()) && $this->getAttribute($context["forumrow"], "TOPICS", array()))) {
                        // line 68
                        echo "\t\t\t\t\t\t\t\t";
                        echo $this->env->getExtension('phpbb')->lang("TOPICS");
                        echo $this->env->getExtension('phpbb')->lang("COLON");
                        echo " <strong>";
                        echo $this->getAttribute($context["forumrow"], "TOPICS", array());
                        echo "</strong>
\t\t\t\t\t\t\t";
                    }
                    // line 70
                    echo "\t\t\t\t\t\t</div>
\t\t\t\t\t\t";
                }
                // line 72
                echo "\t\t\t\t\t</div>
\t\t\t\t</dt>
\t\t\t\t";
                // line 74
                if ($this->getAttribute($context["forumrow"], "CLICKS", array())) {
                    // line 75
                    echo "\t\t\t\t\t<dd class=\"redirect\"><span>";
                    echo $this->env->getExtension('phpbb')->lang("REDIRECTS");
                    echo $this->env->getExtension('phpbb')->lang("COLON");
                    echo " ";
                    echo $this->getAttribute($context["forumrow"], "CLICKS", array());
                    echo "</span></dd>
\t\t\t\t";
                } elseif ( !$this->getAttribute(                // line 76
$context["forumrow"], "S_IS_LINK", array())) {
                    // line 77
                    echo "\t\t\t\t\t<dd class=\"topics\">";
                    echo $this->getAttribute($context["forumrow"], "TOPICS", array());
                    echo " <dfn>";
                    echo $this->env->getExtension('phpbb')->lang("TOPICS");
                    echo "</dfn></dd>
\t\t\t\t\t<dd class=\"posts\">";
                    // line 78
                    echo $this->getAttribute($context["forumrow"], "POSTS", array());
                    echo " <dfn>";
                    echo $this->env->getExtension('phpbb')->lang("POSTS");
                    echo "</dfn></dd>
\t\t\t\t\t<dd class=\"lastpost\">
\t\t\t\t\t\t<span>
\t\t\t\t\t\t\t";
                    // line 81
                    if ($this->getAttribute($context["forumrow"], "U_UNAPPROVED_TOPICS", array())) {
                        // line 82
                        echo "\t\t\t\t\t\t\t\t<a href=\"";
                        echo $this->getAttribute($context["forumrow"], "U_UNAPPROVED_TOPICS", array());
                        echo "\" title=\"";
                        echo $this->env->getExtension('phpbb')->lang("TOPICS_UNAPPROVED");
                        echo "\">
\t\t\t\t\t\t\t\t\t<i class=\"icon fa-question fa-fw icon-blue\" aria-hidden=\"true\"></i><span class=\"sr-only\">";
                        // line 83
                        echo $this->env->getExtension('phpbb')->lang("TOPICS_UNAPPROVED");
                        echo "</span>
\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t";
                    } elseif ($this->getAttribute(                    // line 85
$context["forumrow"], "U_UNAPPROVED_POSTS", array())) {
                        // line 86
                        echo "\t\t\t\t\t\t\t\t<a href=\"";
                        echo $this->getAttribute($context["forumrow"], "U_UNAPPROVED_POSTS", array());
                        echo "\" title=\"";
                        echo $this->env->getExtension('phpbb')->lang("POSTS_UNAPPROVED_FORUM");
                        echo "\">
\t\t\t\t\t\t\t\t\t<i class=\"icon fa-question fa-fw icon-blue\" aria-hidden=\"true\"></i><span class=\"sr-only\">";
                        // line 87
                        echo $this->env->getExtension('phpbb')->lang("POSTS_UNAPPROVED_FORUM");
                        echo "</span>
\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t";
                    }
                    // line 90
                    echo "\t\t\t\t\t\t\t";
                    if ($this->getAttribute($context["forumrow"], "LAST_POST_TIME", array())) {
                        // line 91
                        echo "\t\t\t\t\t\t\t\t<dfn>";
                        echo $this->env->getExtension('phpbb')->lang("LAST_POST");
                        echo "</dfn>
\t\t\t\t\t\t\t\t";
                        // line 92
                        if ($this->getAttribute($context["forumrow"], "S_DISPLAY_SUBJECT", array())) {
                            // line 93
                            echo "\t\t\t\t\t\t\t\t\t";
                            // line 94
                            echo "\t\t\t\t\t\t\t\t\t<a href=\"";
                            echo $this->getAttribute($context["forumrow"], "U_LAST_POST", array());
                            echo "\" title=\"";
                            echo $this->getAttribute($context["forumrow"], "LAST_POST_SUBJECT", array());
                            echo "\" class=\"lastsubject\">";
                            echo $this->getAttribute($context["forumrow"], "LAST_POST_SUBJECT_TRUNCATED", array());
                            echo "</a> <br />
\t\t\t\t\t\t\t\t";
                        }
                        // line 96
                        echo "\t\t\t\t\t\t\t\t\t";
                        echo $this->env->getExtension('phpbb')->lang("POST_BY_AUTHOR");
                        echo " ";
                        echo $this->getAttribute($context["forumrow"], "LAST_POSTER_FULL", array());
                        echo "
\t\t\t\t\t\t\t\t";
                        // line 97
                        if ( !(isset($context["S_IS_BOT"]) ? $context["S_IS_BOT"] : null)) {
                            // line 98
                            echo "\t\t\t\t\t\t\t\t\t<a href=\"";
                            echo $this->getAttribute($context["forumrow"], "U_LAST_POST", array());
                            echo "\" title=\"";
                            echo $this->env->getExtension('phpbb')->lang("VIEW_LATEST_POST");
                            echo "\">
\t\t\t\t\t\t\t\t\t\t<i class=\"icon fa-external-link-square fa-fw icon-lightgray icon-md\" aria-hidden=\"true\"></i><span class=\"sr-only\">";
                            // line 99
                            echo $this->env->getExtension('phpbb')->lang("VIEW_LATEST_POST");
                            echo "</span>
\t\t\t\t\t\t\t\t\t</a>
\t\t\t\t\t\t\t\t";
                        }
                        // line 102
                        echo "\t\t\t\t\t\t\t\t<br />";
                        echo $this->getAttribute($context["forumrow"], "LAST_POST_TIME", array());
                        echo "
\t\t\t\t\t\t\t";
                    } else {
                        // line 104
                        echo "\t\t\t\t\t\t\t\t";
                        echo $this->env->getExtension('phpbb')->lang("NO_POSTS");
                        echo "<br />&nbsp;
\t\t\t\t\t\t\t";
                    }
                    // line 106
                    echo "\t\t\t\t\t\t</span>
\t\t\t\t\t</dd>
\t\t\t\t";
                } else {
                    // line 109
                    echo "\t\t\t\t\t<dd>&nbsp;</dd>
\t\t\t\t";
                }
                // line 111
                echo "\t\t\t</dl>
\t\t\t";
                // line 112
                // line 113
                echo "\t\t</li>
\t\t";
                // line 114
                // line 115
                echo "\t";
            }
            // line 116
            echo "
\t";
            // line 117
            if ($this->getAttribute($context["forumrow"], "S_LAST_ROW", array())) {
                // line 118
                echo "\t\t\t</ul>

\t\t\t</div>
\t\t</div>
\t";
                // line 122
                // line 123
                echo "\t";
            }
            // line 124
            echo "
";
            $context['_iterated'] = true;
        }
        if (!$context['_iterated']) {
            // line 126
            echo "\t<div class=\"panel\">
\t\t<div class=\"inner\">
\t\t<strong>";
            // line 128
            echo $this->env->getExtension('phpbb')->lang("NO_FORUMS");
            echo "</strong>
\t\t</div>
\t</div>
";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['_key'], $context['forumrow'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
    }

    public function getTemplateName()
    {
        return "forumlist_body.html";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  430 => 128,  426 => 126,  420 => 124,  417 => 123,  416 => 122,  410 => 118,  408 => 117,  405 => 116,  402 => 115,  401 => 114,  398 => 113,  397 => 112,  394 => 111,  390 => 109,  385 => 106,  379 => 104,  373 => 102,  367 => 99,  360 => 98,  358 => 97,  351 => 96,  341 => 94,  339 => 93,  337 => 92,  332 => 91,  329 => 90,  323 => 87,  316 => 86,  314 => 85,  309 => 83,  302 => 82,  300 => 81,  292 => 78,  285 => 77,  283 => 76,  275 => 75,  273 => 74,  269 => 72,  265 => 70,  256 => 68,  254 => 67,  246 => 66,  244 => 65,  241 => 64,  239 => 63,  236 => 62,  233 => 61,  231 => 60,  225 => 59,  221 => 58,  204 => 56,  187 => 55,  183 => 54,  177 => 53,  175 => 52,  172 => 51,  163 => 49,  160 => 48,  155 => 47,  148 => 46,  141 => 45,  132 => 41,  122 => 40,  119 => 39,  117 => 38,  114 => 37,  108 => 36,  104 => 35,  99 => 34,  98 => 33,  95 => 32,  93 => 31,  91 => 30,  88 => 29,  86 => 28,  80 => 24,  79 => 23,  74 => 21,  70 => 20,  66 => 19,  54 => 18,  51 => 17,  50 => 16,  44 => 12,  41 => 11,  40 => 10,  37 => 9,  30 => 4,  27 => 3,  22 => 2,  19 => 1,);
    }
}
/* */
/* <!-- BEGIN forumrow -->*/
/* 	<!-- IF (forumrow.S_IS_CAT and not forumrow.S_FIRST_ROW) or forumrow.S_NO_CAT  -->*/
/* 			</ul>*/
/* */
/* 			</div>*/
/* 		</div>*/
/* 	<!-- ENDIF -->*/
/* */
/* 	<!-- EVENT forumlist_body_category_header_before -->*/
/* 	<!-- IF forumrow.S_IS_CAT or forumrow.S_FIRST_ROW  or forumrow.S_NO_CAT  -->*/
/* 		<div class="forabg">*/
/* 			<div class="inner">*/
/* 			<ul class="topiclist">*/
/* 				<li class="header">*/
/* 					<!-- EVENT forumlist_body_category_header_row_prepend -->*/
/* 					<dl class="row-item">*/
/* 						<dt><div class="list-inner"><!-- IF forumrow.S_IS_CAT --><a href="{forumrow.U_VIEWFORUM}">{forumrow.FORUM_NAME}</a><!-- ELSE -->{L_FORUM}<!-- ENDIF --></div></dt>*/
/* 						<dd class="topics">{L_TOPICS}</dd>*/
/* 						<dd class="posts">{L_POSTS}</dd>*/
/* 						<dd class="lastpost"><span>{L_LAST_POST}</span></dd>*/
/* 					</dl>*/
/* 					<!-- EVENT forumlist_body_category_header_row_append -->*/
/* 				</li>*/
/* 			</ul>*/
/* 			<ul class="topiclist forums">*/
/* 	<!-- ENDIF -->*/
/* 	<!-- EVENT forumlist_body_category_header_after -->*/
/* */
/* 	<!-- IF not forumrow.S_IS_CAT -->*/
/* 		<!-- EVENT forumlist_body_forum_row_before -->*/
/* 		<li class="row">*/
/* 			<!-- EVENT forumlist_body_forum_row_prepend -->*/
/* 			<dl class="row-item {forumrow.FORUM_IMG_STYLE}">*/
/* 				<dt title="{forumrow.FORUM_FOLDER_IMG_ALT}">*/
/* 					<!-- IF forumrow.S_UNREAD_FORUM --><a href="{forumrow.U_VIEWFORUM}" class="row-item-link"></a><!-- ENDIF -->*/
/* 					<div class="list-inner">*/
/* 						<!-- IF S_ENABLE_FEEDS and forumrow.S_FEED_ENABLED -->*/
/* 							<!--*/
/* 								<a class="feed-icon-forum" title="{L_FEED} - {forumrow.FORUM_NAME}" href="{U_FEED}?f={forumrow.FORUM_ID}">*/
/* 									<i class="icon fa-rss-square fa-fw icon-orange" aria-hidden="true"></i><span class="sr-only">{L_FEED} - {forumrow.FORUM_NAME}</span>*/
/* 								</a>*/
/* 							-->*/
/* 						<!-- ENDIF -->*/
/* 						<!-- IF forumrow.FORUM_IMAGE --><span class="forum-image">{forumrow.FORUM_IMAGE}</span><!-- ENDIF -->*/
/* 						<a href="{forumrow.U_VIEWFORUM}" class="forumtitle">{forumrow.FORUM_NAME}</a>*/
/* 						<!-- IF forumrow.FORUM_DESC --><br />{forumrow.FORUM_DESC}<!-- ENDIF -->*/
/* 						<!-- IF forumrow.MODERATORS -->*/
/* 							<br /><strong>{forumrow.L_MODERATOR_STR}{L_COLON}</strong> {forumrow.MODERATORS}*/
/* 						<!-- ENDIF -->*/
/* 						<!-- IF .forumrow.subforum and forumrow.S_LIST_SUBFORUMS -->*/
/* 							<!-- EVENT forumlist_body_subforums_before -->*/
/* 							<br /><strong>{forumrow.L_SUBFORUM_STR}{L_COLON}</strong>*/
/* 							<!-- BEGIN subforum -->*/
/* 								<a href="{forumrow.subforum.U_SUBFORUM}" class="subforum<!-- IF forumrow.subforum.S_UNREAD --> unread<!-- ELSE --> read<!-- ENDIF -->" title="<!-- IF forumrow.subforum.S_UNREAD -->{L_UNREAD_POSTS}<!-- ELSE -->{L_NO_UNREAD_POSTS}<!-- ENDIF -->">*/
/* 									<i class="icon <!-- IF forumrow.subforum.IS_LINK -->fa-external-link<!-- ELSE -->fa-file-o<!-- ENDIF --> fa-fw <!-- IF forumrow.subforum.S_UNREAD --> icon-red<!-- ELSE --> icon-blue<!-- ENDIF --> icon-md" aria-hidden="true"></i>{forumrow.subforum.SUBFORUM_NAME}*/
/* 								</a>*/
/* 								<!-- IF not forumrow.subforum.S_LAST_ROW -->{L_COMMA_SEPARATOR}<!-- ENDIF -->*/
/* 							<!-- END subforum -->*/
/* 							<!-- EVENT forumlist_body_subforums_after -->*/
/* 						<!-- ENDIF -->*/
/* */
/* 						<!-- IF not S_IS_BOT -->*/
/* 						<div class="responsive-show" style="display: none;">*/
/* 							<!-- IF forumrow.CLICKS -->*/
/* 								{L_REDIRECTS}{L_COLON} <strong>{forumrow.CLICKS}</strong>*/
/* 							<!-- ELSEIF not forumrow.S_IS_LINK and forumrow.TOPICS -->*/
/* 								{L_TOPICS}{L_COLON} <strong>{forumrow.TOPICS}</strong>*/
/* 							<!-- ENDIF -->*/
/* 						</div>*/
/* 						<!-- ENDIF -->*/
/* 					</div>*/
/* 				</dt>*/
/* 				<!-- IF forumrow.CLICKS -->*/
/* 					<dd class="redirect"><span>{L_REDIRECTS}{L_COLON} {forumrow.CLICKS}</span></dd>*/
/* 				<!-- ELSEIF not forumrow.S_IS_LINK -->*/
/* 					<dd class="topics">{forumrow.TOPICS} <dfn>{L_TOPICS}</dfn></dd>*/
/* 					<dd class="posts">{forumrow.POSTS} <dfn>{L_POSTS}</dfn></dd>*/
/* 					<dd class="lastpost">*/
/* 						<span>*/
/* 							<!-- IF forumrow.U_UNAPPROVED_TOPICS -->*/
/* 								<a href="{forumrow.U_UNAPPROVED_TOPICS}" title="{L_TOPICS_UNAPPROVED}">*/
/* 									<i class="icon fa-question fa-fw icon-blue" aria-hidden="true"></i><span class="sr-only">{L_TOPICS_UNAPPROVED}</span>*/
/* 								</a>*/
/* 							<!-- ELSEIF forumrow.U_UNAPPROVED_POSTS -->*/
/* 								<a href="{forumrow.U_UNAPPROVED_POSTS}" title="{L_POSTS_UNAPPROVED_FORUM}">*/
/* 									<i class="icon fa-question fa-fw icon-blue" aria-hidden="true"></i><span class="sr-only">{L_POSTS_UNAPPROVED_FORUM}</span>*/
/* 								</a>*/
/* 							<!-- ENDIF -->*/
/* 							<!-- IF forumrow.LAST_POST_TIME -->*/
/* 								<dfn>{L_LAST_POST}</dfn>*/
/* 								<!-- IF forumrow.S_DISPLAY_SUBJECT -->*/
/* 									<!-- EVENT forumlist_body_last_post_title_prepend -->*/
/* 									<a href="{forumrow.U_LAST_POST}" title="{forumrow.LAST_POST_SUBJECT}" class="lastsubject">{forumrow.LAST_POST_SUBJECT_TRUNCATED}</a> <br />*/
/* 								<!-- ENDIF -->*/
/* 									{L_POST_BY_AUTHOR} {forumrow.LAST_POSTER_FULL}*/
/* 								<!-- IF not S_IS_BOT -->*/
/* 									<a href="{forumrow.U_LAST_POST}" title="{L_VIEW_LATEST_POST}">*/
/* 										<i class="icon fa-external-link-square fa-fw icon-lightgray icon-md" aria-hidden="true"></i><span class="sr-only">{L_VIEW_LATEST_POST}</span>*/
/* 									</a>*/
/* 								<!-- ENDIF -->*/
/* 								<br />{forumrow.LAST_POST_TIME}*/
/* 							<!-- ELSE -->*/
/* 								{L_NO_POSTS}<br />&nbsp;*/
/* 							<!-- ENDIF -->*/
/* 						</span>*/
/* 					</dd>*/
/* 				<!-- ELSE -->*/
/* 					<dd>&nbsp;</dd>*/
/* 				<!-- ENDIF -->*/
/* 			</dl>*/
/* 			<!-- EVENT forumlist_body_forum_row_append -->*/
/* 		</li>*/
/* 		<!-- EVENT forumlist_body_forum_row_after -->*/
/* 	<!-- ENDIF -->*/
/* */
/* 	<!-- IF forumrow.S_LAST_ROW -->*/
/* 			</ul>*/
/* */
/* 			</div>*/
/* 		</div>*/
/* 	<!-- EVENT forumlist_body_last_row_after -->*/
/* 	<!-- ENDIF -->*/
/* */
/* <!-- BEGINELSE -->*/
/* 	<div class="panel">*/
/* 		<div class="inner">*/
/* 		<strong>{L_NO_FORUMS}</strong>*/
/* 		</div>*/
/* 	</div>*/
/* <!-- END forumrow -->*/
/* */
