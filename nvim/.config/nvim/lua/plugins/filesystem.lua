return {
	{
		"nvim-telescope/telescope.nvim",
		dependencies = { "nvim-lua/plenary.nvim", "nvim-telescope/telescope-symbols.nvim" },
		config = function()
			local telescope = require("telescope")
			local builtins = require("telescope.builtin")

			telescope.setup({
				defaults = {
					prompt_prefix = " ",
					sorting_strategy = "ascending",
					layout_config = {
						prompt_position = "top",
					},
					-- Configure Telescope to use bat for file previews
					file_previewer = function(...)
						require("telescope.previewers").cat.new({
							cmd = { "bat", "--style=numbers,changes", "--color=always" },
						})(...)
					end,
				},
				pickers = {
					find_files = {
						-- Use fd instead of ripgrep for file finding
						find_command = { "fd", "--type", "file", "--hidden", "--follow", "--exclude", ".git" },
					},
					buffers = {
						show_all_buffers = true,
					},
					live_grep = {
						vimgrep_arguments = {
							"rg",
							"-g",
							"!.git",
							"--hidden",
							"--color=never",
							"--no-heading",
							"--with-filename",
							"--line-number",
							"--column",
							"--smart-case",
						},
					},
				},
			})

			-- Define some mappings
			-- TODO: describe leader key
			-- TODO: describe mappings
			vim.keymap.set("n", "<leader><leader>", builtins.find_files)
			vim.keymap.set("n", "<leader>/", builtins.live_grep)
			vim.keymap.set("n", "<leader><bs>", builtins.buffers)
			vim.keymap.set("n", "<leader>f.", builtins.resume)
			vim.keymap.set("n", "<leader>lo", builtins.lsp_document_symbols)
			vim.keymap.set("n", "<leader>lO", vim.lsp.buf.document_symbol)
			vim.keymap.set("n", "<leader>fi", "<CMD>Telescope symbols<CR>")
		end,
	},
	{
		"luukvbaal/nnn.nvim",
		config = function()
			local nnn = require("nnn")
			require("nnn").setup({
				mappings = {
					{ "<C-t>", nnn.builtin.open_in_tab }, -- open file(s) in tab
					{ "<C-x>", nnn.builtin.open_in_split }, -- open file(s) in split
					{ "<C-v>", nnn.builtin.open_in_vsplit }, -- open file(s) in vertical split
					{ "<C-y>", nnn.builtin.copy_to_clipboard }, -- copy file(s) to clipboard
				},
			})
		end,
	},
}
