return {
	"tpope/vim-fugitive",
	{
		"sindrets/diffview.nvim",
		dependencies = { "nvim-tree/nvim-web-devicons" },
		cmd = { "DiffviewOpen", "DiffviewFileHistory" },
		keys = {
			{ "<leader>gd", "<cmd>DiffviewOpen<cr>", desc = "Diffview (working tree)" },
			{ "<leader>gH", "<cmd>DiffviewFileHistory %<cr>", desc = "Diffview file history" },
			{ "<leader>gq", "<cmd>DiffviewClose<cr>", desc = "Diffview close" },
		},
		opts = {},
	},
	{
		"pwntester/octo.nvim",
		dependencies = {
			"nvim-lua/plenary.nvim",
			"nvim-telescope/telescope.nvim",
			"nvim-tree/nvim-web-devicons",
		},
		cmd = "Octo",
		keys = {
			{ "<leader>gr", "<cmd>Octo pr list<cr>", desc = "Octo: PRs" },
			{ "<leader>gi", "<cmd>Octo issue list<cr>", desc = "Octo: issues" },
		},
		opts = {},
	},
	{
		"lewis6991/gitsigns.nvim",
		config = function()
			local gitsigns = require("gitsigns")

			function next_hunk()
				-- Move to next hunk
				gitsigns.next_hunk()
				-- center cursor
				vim.cmd("normal zz")
			end

			function prev_hunk()
				-- Move to prev hunk
				gitsigns.prev_hunk()
				-- center cursor
				vim.cmd("normal zz")
			end

			gitsigns.setup({
				signs = {
					add = { text = "│" },
					change = { text = "│" },
					delete = { text = "│" },
					topdelete = { text = "│" },
					changedelete = { text = "│" },
				},
				on_attach = function(bufnr)
					local map = vim.keymap.set
					local opts = { silent = true }

					map("n", "]g", next_hunk, opts)
					map("n", "[g", prev_hunk, opts)
					map("n", "<leader>g+", gitsigns.stage_hunk, opts)
					map("n", "<leader>g-", gitsigns.undo_stage_hunk, opts)
					map("n", "<leader>g=", gitsigns.reset_hunk, opts)
					map("n", "<leader>gp", gitsigns.preview_hunk, opts)
				end,
			})
		end,
	},
}
